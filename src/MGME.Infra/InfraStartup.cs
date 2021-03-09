using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

using MGME.Infra.Data;

namespace MGME.Infra
{
    public static class InfraSetup
    {
        /*
        An extension for services to separate database creation from main Startup
        We supply connection string from the main ../MGME.Web/Startup.cs
        */
        public static void AddDbContext(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString)
            );
        }

        // An extension to add repositories
        public static void AddRepositories(this IServiceCollection services)
        {

        }
    }
}