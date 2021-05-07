using System;

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

        public DbSet<PlayerCharacter> PlayerCharacters { get; set; }

        public DbSet<NonPlayerCharacter> NonPlayerCharacters { get; set; }

        public DbSet<Adventure> Adventures { get; set; }

        public DbSet<Thread> Threads { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            /* User */

            modelBuilder.Entity<User>().HasIndex(user => user.Name).IsUnique();

            modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();

            modelBuilder.Entity<User>().Property(user => user.EmailIsConfirmed).HasDefaultValue(false);

            modelBuilder.Entity<User>().Property(user => user.Role).HasDefaultValue(UserRole.GAME_MASTER);

            /* PlayerCharacter */

            modelBuilder.Entity<PlayerCharacter>().HasIndex(
                playerCharacter => new { playerCharacter.UserId, playerCharacter.Name }
            ).IsUnique();

            /* NonPlayerCharacter */

            // Think of the OnDelete actions, in such that deleting character
            // Does not delete the npc

            modelBuilder.Entity<NonPlayerCharacter>().HasIndex(
                nonPlayerCharacter => new { nonPlayerCharacter.UserId, nonPlayerCharacter.Name }
            ).IsUnique();

            /* Adventure */

            modelBuilder.Entity<Adventure>().HasIndex(
                adventure => new { adventure.UserId, adventure.Title }
            ).IsUnique();

            modelBuilder.Entity<Adventure>().Property(
                adventure => adventure.ChaosFactor
            ).HasDefaultValue(5);

            modelBuilder.Entity<Adventure>().Property(
                adventure => adventure.Resolved
            ).HasDefaultValue(false);

            modelBuilder.Entity<Adventure>().Property(
                adventure => adventure.CreatedAt
            ).HasDefaultValue(DateTime.Now);

            /* Thread */

            modelBuilder.Entity<Thread>().HasIndex(
                thread => new { thread.UserId, thread.Name }
            ).IsUnique();
        }
    }
}