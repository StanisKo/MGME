using System;
using System.Threading;
using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

using MGME.Core.Entities;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.Auth
{
    public class TokenRecycleService : IHostedService, IDisposable
    {
        private readonly ILogger _logger;

        private readonly IConfiguration _configuration;

        private readonly IEntityRepository<RefreshToken> _tokenRepository;

        private Timer _timer;

        private int _numberOfDbRuns = 0;
        private const int _MAX_DB_RUNS = 1;

        public TokenRecycleService(ILogger<TokenRecycleService> logger,
                                   IConfiguration configuration,
                                   IEntityRepository<RefreshToken> tokenRepository)
        {
            _logger = logger;
            _configuration = configuration;
            _tokenRepository = tokenRepository;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            if (cancellationToken.IsCancellationRequested)
            {
                _logger.LogError("Cancellation request was received before recycle service started");

                cancellationToken.ThrowIfCancellationRequested();
            }

            _timer = new Timer(
                RecycleExpiredTokens,
                null,
                0,
                Convert.ToInt16(_configuration["TokensLifetime:RefreshTokenHours"])
            );

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

                List<RefreshToken> expiredTokens = await _tokenRepository.GetEntititesAsync(
                    predicate: token => DateTime.UtcNow >= token.Expires
                );

                await _tokenRepository.DeleteEntitiesAsync(expiredTokens);

                Interlocked.Decrement(ref _numberOfDbRuns);
            }
        }
    }
}