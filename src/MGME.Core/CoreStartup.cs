using Microsoft.Extensions.DependencyInjection;

using AutoMapper;

using MGME.Core.Interfaces.Services;
using MGME.Core.Services;
using MGME.Core.Services.AuthService;
using MGME.Core.Services.UserService;
using MGME.Core.Services.PlayerCharacterService;
using MGME.Core.Services.NonPlayerCharacterService;
using MGME.Core.Services.AdventureService;
using MGME.Core.Utils.Sorters;

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
            services.AddHostedService<TokenRecycleService>();

            services.AddScoped<IHashingService, HashingService>();

            services.AddScoped<IAuthService, AuthService>();

            services.AddScoped<IUserService, UserService>();

            services.AddScoped<IPlayerCharacterService, PlayerCharacterService>();

            services.AddScoped<PlayerCharacterSorter>();

            services.AddScoped<INonPlayerCharacterService, NonPlayerCharacterService>();

            services.AddScoped<IAdventureService, AdventureService>();
        }
    }
}