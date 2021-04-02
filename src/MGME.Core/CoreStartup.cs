using Microsoft.Extensions.DependencyInjection;

using AutoMapper;

using MGME.Core.Interfaces.Services;
using MGME.Core.Services.AuthService;
using MGME.Core.Services.UserService;

namespace MGME.Core
{
    public static class CoreStartup
    {
        public static void AddAutoMapper(this IServiceCollection services)
        {
            services.AddAutoMapper(typeof(CoreStartup));
        }

        /*
        We add our business services here to separate them from main ASP .NET Core middleware
        */
        public static void AddBusinessServices(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();

            services.AddHostedService<TokenRecycleService>();

            services.AddScoped<IUserService, UserService>();
        }
    }
}