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

        public DbSet<Scene> Scenes { get; set; }

        public DbSet<SceneItem> SceneItems { get; set; }

        public DbSet<FateQuestion> FateQuestions { get; set; }

        public DbSet<RandomEvent> RandomEvents { get; set; }

        public DbSet<Battle> Battles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            /* User */

            modelBuilder.Entity<User>().HasIndex(user => user.Name).IsUnique();

            modelBuilder.Entity<User>().HasIndex(user => user.Email).IsUnique();

            modelBuilder.Entity<User>().Property(user => user.EmailIsConfirmed).HasDefaultValue(false);

            modelBuilder.Entity<User>().Property(user => user.Role).HasDefaultValue(UserRoles.GAME_MASTER);

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
            ).HasDefaultValueSql("NOW()")
            .ValueGeneratedOnAdd();

            /* Thread */

            /*
            Threads are unique within the context of one PlayerCharacter
            or one Adventure, but can repeat accross those entities
            */

            modelBuilder.Entity<Thread>().HasIndex(
                thread => new { thread.PlayerCharacterId, thread.Name }
            ).IsUnique();

            modelBuilder.Entity<Thread>().HasIndex(
                thread => new { thread.AdventureId, thread.Name }
            ).IsUnique();

            /*
            We explicitly configure relations for Threads
            Since we want Cascade delete behavior even in case of
            nullable foreign keys:

            If PlayerCharacter is deleted, so are his/her Threads, even those
            that became Adventure's Threads

            If Adventure is deleted, so are its Threads, even those
            that were taken from PlayerCharacter(s)
            */

            modelBuilder.Entity<Thread>()
                .HasOne(thread => thread.PlayerCharacter)
                .WithMany(playerCharacter => playerCharacter.Threads)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Thread>()
                .HasOne(thread => thread.Adventure)
                .WithMany(adventure => adventure.Threads)
                .OnDelete(DeleteBehavior.Cascade);

            /* Scene */

            modelBuilder.Entity<Scene>().HasIndex(
                scene => new { scene.AdventureId, scene.Title }
            ).IsUnique();

            modelBuilder.Entity<Scene>().Property(
                scene => scene.Resolved
            ).HasDefaultValue(false);

            modelBuilder.Entity<Scene>().Property(
                scene => scene.CreatedAt
            ).HasDefaultValueSql("NOW()")
            .ValueGeneratedOnAdd();

            /* SceneItem */

            modelBuilder.Entity<SceneItem>().Property(
                sceneItem => sceneItem.CreatedAt
            ).HasDefaultValueSql("NOW()")
            .ValueGeneratedOnAdd();
        }
    }
}