using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using MGME.Core.Entities;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.AuthService
{
    public class TokenRecycleService : IHostedService, IDisposable
    {
        private readonly ILogger _logger;

        private readonly IConfiguration _configuration;

        private readonly IServiceScopeFactory _scopeFactory;

        private Timer _timer;

        private int _numberOfDbRuns = 0;
        private const int _MAX_DB_RUNS = 1;

        public TokenRecycleService(ILogger<TokenRecycleService> logger,
                                   IConfiguration configuration,
                                   IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _configuration = configuration;
            _scopeFactory = scopeFactory;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogError("Cancellation request was received before recycle service started");

                cancellationToken.ThrowIfCancellationRequested();
            }

            int interval = (int)TimeSpan.FromHours(
                Convert.ToInt32(_configuration["TokensLifetime:RefreshTokenHours"])
            ).TotalMilliseconds;

            _timer = new Timer(RecycleExpiredTokens, null, 0, interval);

            return Task.CompletedTask;
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogError("Cancellation request was received before recycle service stopped");

                cancellationToken.ThrowIfCancellationRequested();
            }

            _timer?.Change(Timeout.Infinite, Timeout.Infinite);

            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }

        private async void RecycleExpiredTokens(object state)
        {
            if (_numberOfDbRuns < _MAX_DB_RUNS)
            {
                Interlocked.Increment(ref _numberOfDbRuns);

                using (IServiceScope scope = _scopeFactory.CreateScope())
                {
                    IEntityRepository<RefreshToken> tokenRepository =
                        scope.ServiceProvider.GetRequiredService<IEntityRepository<RefreshToken>>();

                    List<RefreshToken> expiredTokens = await tokenRepository.GetEntititesAsync(
                        predicate: token => DateTime.UtcNow >= token.Expires
                    );

                    if (expiredTokens.Count > 0)
                    {
                        await tokenRepository.DeleteEntitiesAsync(expiredTokens);
                    }
                }

                Interlocked.Decrement(ref _numberOfDbRuns);
            }
        }
    }
}