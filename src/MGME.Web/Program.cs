using System;
using System.IO;
using System.Threading;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;

using MGME.Infra.Data;

namespace MGME.Web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            IHost host = CreateHostBuilder(args).Build();

            using (IServiceScope scope = host.Services.CreateScope())
            {
                /*
                Strictly necessary when running app in container:

                Even though we use wait package in Dockerfile, it still misses the bit
                When database already initialized and migrations were run before;
                And runs dll before database can accept connections

                Therefore, we need to check here and wait
                */
                ApplicationDbContext databaseContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                while (!databaseContext.Database.CanConnect())
                {
                    Console.WriteLine("Npgsql is connecting to the database");

                    Thread.Sleep(5000);
                }

                databaseContext.Database.Migrate();
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args)
        {
            /*
            Environment file parsing is necessary only for local development

            Since we cannot point asp to .env file as we can via docker-compose,
            We need to pin down the file and load the variables into memory programmatically
            */
            string rootDirectory = Directory.GetCurrentDirectory();

            string environmentFile = Path.Combine(rootDirectory, "../../.env");

            DotEnv.Load(environmentFile);

            return Host.CreateDefaultBuilder(args).ConfigureAppConfiguration((_, config) =>
                {
                    config.AddEnvironmentVariables();
                }
            ).ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                }
            );
        }
    }
}