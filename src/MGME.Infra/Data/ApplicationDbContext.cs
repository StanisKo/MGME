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

            modelBuilder.Entity<NonPlayerCharacter>().HasIndex(
                nonPlayerCharacter => new { nonPlayerCharacter.UserId, nonPlayerCharacter.Name }
            ).IsUnique();

            /*
            We explicitly specify the relations between NonPlayerCharacter/User,
            and NonPlayerCharacter/PlayerCharacter since OnDelete actions
            for two types is different: if User is deleted, so are his/her NonPlayerCharacters,
            but if PlayerCharacter is deleted, NonPlayerCharacters are simply unlinked
            */

            modelBuilder.Entity<NonPlayerCharacter>()
                .HasOne(nonPlayerCharacter => nonPlayerCharacter.User)
                .WithMany(user => user.NonPlayerCharacters)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<NonPlayerCharacter>()
                .HasOne(nonPlayerCharacter => nonPlayerCharacter.PlayerCharacter)
                .WithMany(playerCharacter => playerCharacter.NonPlayerCharacters)
                .OnDelete(DeleteBehavior.SetNull);

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

            /*
            We explicitly configure relations for Threads as well
            Since we want Cascade delete behavior even in case of
            nullable foreign keys:

            If PlayerCharacter is deleted, so are his/her Threads, even those
            that became Adventure's Threads

            If Adventure is delered, so are its Threads, even those
            that were taken from PlayerCharacter(s)
            */

            modelBuilder.Entity<Thread>()
                .HasOne(thread => thread.User)
                .WithMany(user => user.Threads)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Thread>()
                .HasOne(thread => thread.PlayerCharacter)
                .WithMany(playerCharacter => playerCharacter.Threads)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Thread>()
                .HasOne(thread => thread.Adventure)
                .WithMany(adventure => adventure.Threads)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}