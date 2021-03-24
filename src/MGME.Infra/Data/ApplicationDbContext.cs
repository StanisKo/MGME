using Microsoft.EntityFrameworkCore;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Infra.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }

        public DbSet<RefreshToken> RefreshTokens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasIndex(user => user.Name).IsUnique();

            modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();

            modelBuilder.Entity<User>().Property(user => user.EmailIsConfirmed).HasDefaultValue(false);

            modelBuilder.Entity<User>().Property(user => user.Role).HasDefaultValue(UserRole.GAME_MASTER);
        }
    }
}