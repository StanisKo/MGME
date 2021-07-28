using System;
using System.Text;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;

using Microsoft.IdentityModel.Tokens;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

using Microsoft.OpenApi.Models;

using Npgsql;

using MGME.Core;
using MGME.Infra;

// develop locally, read .env file like this: https://dusted.codes/dotenv-in-dotnet

namespace MGME.Web
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        private readonly IWebHostEnvironment _environment;

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;

            _environment = environment;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            if (_environment.IsDevelopment())
            {
                // Local dev ? use localhost : otherwise service name is used when running in container
                Environment.SetEnvironmentVariable("SQL_HOST", "localhost");
            }

            NpgsqlConnectionStringBuilder connectionStringBuilder = new NpgsqlConnectionStringBuilder()
            {
                Host = Environment.GetEnvironmentVariable("SQL_HOST"),
                Port = Convert.ToInt32(Environment.GetEnvironmentVariable("SQL_PORT")),
                Database = Environment.GetEnvironmentVariable("SQL_DATABASE"),
                Username = Environment.GetEnvironmentVariable("SQL_USER"),
                Password = Environment.GetEnvironmentVariable("SQL_PASSWORD")
            };

            // Database context: ../MGME.Infra/InfraStartup.cs
            services.AddDbContext(connectionStringBuilder.ConnectionString);

            // Repositories used accross the application: ../MGME.Infra/InfraStartup.cs
            services.AddRepositories();

            // Business services used across the application: ../MGME.Core/CoreStartup.cs
            services.AddBusinessServices();

            // AutoMapper for DTOs: ../MGME.Core/CoreStartup.cs
            services.AddAutoMapper();

            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateIssuerSigningKey = true,

                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.ASCII.GetBytes(Environment.GetEnvironmentVariable("JWTKEY"))
                        ),

                        ValidateIssuer = true,
                        ValidIssuer = Configuration["Host"],

                        ValidateAudience = true,
                        ValidAudience = Configuration["Host"],

                        ValidateLifetime = true,
                        ClockSkew = TimeSpan.Zero
                    };
                });

            services.AddApiVersioning(config =>
            {
                config.DefaultApiVersion = new ApiVersion(1, 0);
            });

            services.AddControllers();

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "MGME.Web", Version = "v1" });
            });

            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });
        }

        public void Configure(IApplicationBuilder app)
        {
            if (_environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MGME.Web v1"));
            }

            app.UseRouting();

            app.UseStaticFiles();

            app.UseSpaStaticFiles();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";

                if (_environment.IsDevelopment())
                {
                    spa.UseReactDevelopmentServer(npmScript: "start");
                }
            });
        }
    }
}
