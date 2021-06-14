﻿// <auto-generated />
using System;
using MGME.Infra.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MGME.Infra.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    [Migration("20210614163207_RemoveUserThreadConstraintAndAddDifferentIndexesInstead")]
    partial class RemoveUserThreadConstraintAndAddDifferentIndexesInstead
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("Relational:MaxIdentifierLength", 63)
                .HasAnnotation("ProductVersion", "5.0.5")
                .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            modelBuilder.Entity("AdventureNonPlayerCharacter", b =>
                {
                    b.Property<int>("AdventuresId")
                        .HasColumnType("integer");

                    b.Property<int>("NonPlayerCharactersId")
                        .HasColumnType("integer");

                    b.HasKey("AdventuresId", "NonPlayerCharactersId");

                    b.HasIndex("NonPlayerCharactersId");

                    b.ToTable("AdventureNonPlayerCharacter");
                });

            modelBuilder.Entity("AdventurePlayerCharacter", b =>
                {
                    b.Property<int>("AdventuresId")
                        .HasColumnType("integer");

                    b.Property<int>("PlayerCharactersId")
                        .HasColumnType("integer");

                    b.HasKey("AdventuresId", "PlayerCharactersId");

                    b.HasIndex("PlayerCharactersId");

                    b.ToTable("AdventurePlayerCharacter");
                });

            modelBuilder.Entity("MGME.Core.Entities.Adventure", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int>("ChaosFactor")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasDefaultValue(5);

                    b.Property<string>("Context")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp without time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<bool>("Resolved")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(false);

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("UserId", "Title")
                        .IsUnique();

                    b.ToTable("Adventures");
                });

            modelBuilder.Entity("MGME.Core.Entities.Battle", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Outcome")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("SceneItemId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("SceneItemId")
                        .IsUnique();

                    b.ToTable("Battles");
                });

            modelBuilder.Entity("MGME.Core.Entities.FateQuestion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<bool>("Answer")
                        .HasColumnType("boolean");

                    b.Property<string>("Interpretation")
                        .HasColumnType("text");

                    b.Property<string>("Question")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("SceneItemId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("SceneItemId")
                        .IsUnique();

                    b.ToTable("FateQuestions");
                });

            modelBuilder.Entity("MGME.Core.Entities.NonPlayerCharacter", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<int?>("PlayerCharacterId")
                        .HasColumnType("integer");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("PlayerCharacterId");

                    b.HasIndex("UserId", "Name")
                        .IsUnique();

                    b.ToTable("NonPlayerCharacters");
                });

            modelBuilder.Entity("MGME.Core.Entities.PlayerCharacter", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("UserId", "Name")
                        .IsUnique();

                    b.ToTable("PlayerCharacters");
                });

            modelBuilder.Entity("MGME.Core.Entities.RandomEvent", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int>("Focus")
                        .HasColumnType("integer");

                    b.Property<string>("Interpetation")
                        .HasColumnType("text");

                    b.Property<int>("Meaning")
                        .HasColumnType("integer");

                    b.Property<int>("SceneItemId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("SceneItemId")
                        .IsUnique();

                    b.ToTable("RandomEvents");
                });

            modelBuilder.Entity("MGME.Core.Entities.RefreshToken", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<DateTime>("Expires")
                        .HasColumnType("timestamp without time zone");

                    b.Property<string>("Token")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<int>("UserId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("RefreshTokens");
                });

            modelBuilder.Entity("MGME.Core.Entities.Scene", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int>("AdventureId")
                        .HasColumnType("integer");

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp without time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<string>("InterruptEvent")
                        .HasColumnType("text");

                    b.Property<string>("ModifiedSetup")
                        .HasColumnType("text");

                    b.Property<bool>("Resolved")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(false);

                    b.Property<string>("Setup")
                        .IsRequired()
                        .HasColumnType("text");

                    b.Property<string>("Title")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<int?>("Type")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("AdventureId", "Title")
                        .IsUnique();

                    b.ToTable("Scenes");
                });

            modelBuilder.Entity("MGME.Core.Entities.SceneItem", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<DateTime>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("timestamp without time zone")
                        .HasDefaultValueSql("NOW()");

                    b.Property<int>("SceneId")
                        .HasColumnType("integer");

                    b.Property<int>("Type")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("SceneId");

                    b.ToTable("SceneItems");
                });

            modelBuilder.Entity("MGME.Core.Entities.Thread", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<int?>("AdventureId")
                        .HasColumnType("integer");

                    b.Property<string>("Description")
                        .HasColumnType("text");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<int?>("PlayerCharacterId")
                        .HasColumnType("integer");

                    b.HasKey("Id");

                    b.HasIndex("AdventureId", "Name")
                        .IsUnique();

                    b.HasIndex("PlayerCharacterId", "Name")
                        .IsUnique();

                    b.ToTable("Threads");
                });

            modelBuilder.Entity("MGME.Core.Entities.User", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("integer")
                        .HasAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<bool>("EmailIsConfirmed")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("boolean")
                        .HasDefaultValue(false);

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(254)
                        .HasColumnType("character varying(254)");

                    b.Property<byte[]>("PasswordHash")
                        .IsRequired()
                        .HasColumnType("bytea");

                    b.Property<byte[]>("PasswordSalt")
                        .IsRequired()
                        .HasColumnType("bytea");

                    b.Property<string>("Role")
                        .IsRequired()
                        .ValueGeneratedOnAdd()
                        .HasColumnType("text")
                        .HasDefaultValue("GameMaster");

                    b.HasKey("Id");

                    b.HasIndex("Email")
                        .IsUnique();

                    b.HasIndex("Name")
                        .IsUnique();

                    b.ToTable("Users");
                });

            modelBuilder.Entity("AdventureNonPlayerCharacter", b =>
                {
                    b.HasOne("MGME.Core.Entities.Adventure", null)
                        .WithMany()
                        .HasForeignKey("AdventuresId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MGME.Core.Entities.NonPlayerCharacter", null)
                        .WithMany()
                        .HasForeignKey("NonPlayerCharactersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("AdventurePlayerCharacter", b =>
                {
                    b.HasOne("MGME.Core.Entities.Adventure", null)
                        .WithMany()
                        .HasForeignKey("AdventuresId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("MGME.Core.Entities.PlayerCharacter", null)
                        .WithMany()
                        .HasForeignKey("PlayerCharactersId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("MGME.Core.Entities.Adventure", b =>
                {
                    b.HasOne("MGME.Core.Entities.User", "User")
                        .WithMany("Adventures")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("MGME.Core.Entities.Battle", b =>
                {
                    b.HasOne("MGME.Core.Entities.SceneItem", "SceneItem")
                        .WithOne("Battle")
                        .HasForeignKey("MGME.Core.Entities.Battle", "SceneItemId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SceneItem");
                });

            modelBuilder.Entity("MGME.Core.Entities.FateQuestion", b =>
                {
                    b.HasOne("MGME.Core.Entities.SceneItem", "SceneItem")
                        .WithOne("FateQuestion")
                        .HasForeignKey("MGME.Core.Entities.FateQuestion", "SceneItemId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SceneItem");
                });

            modelBuilder.Entity("MGME.Core.Entities.NonPlayerCharacter", b =>
                {
                    b.HasOne("MGME.Core.Entities.PlayerCharacter", "PlayerCharacter")
                        .WithMany("NonPlayerCharacters")
                        .HasForeignKey("PlayerCharacterId")
                        .OnDelete(DeleteBehavior.SetNull);

                    b.HasOne("MGME.Core.Entities.User", "User")
                        .WithMany("NonPlayerCharacters")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("PlayerCharacter");

                    b.Navigation("User");
                });

            modelBuilder.Entity("MGME.Core.Entities.PlayerCharacter", b =>
                {
                    b.HasOne("MGME.Core.Entities.User", "User")
                        .WithMany("PlayerCharacters")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("MGME.Core.Entities.RandomEvent", b =>
                {
                    b.HasOne("MGME.Core.Entities.SceneItem", "SceneItem")
                        .WithOne("RandomEvent")
                        .HasForeignKey("MGME.Core.Entities.RandomEvent", "SceneItemId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SceneItem");
                });

            modelBuilder.Entity("MGME.Core.Entities.RefreshToken", b =>
                {
                    b.HasOne("MGME.Core.Entities.User", "User")
                        .WithMany("RefreshTokens")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("User");
                });

            modelBuilder.Entity("MGME.Core.Entities.Scene", b =>
                {
                    b.HasOne("MGME.Core.Entities.Adventure", "Adventure")
                        .WithMany("Scenes")
                        .HasForeignKey("AdventureId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Adventure");
                });

            modelBuilder.Entity("MGME.Core.Entities.SceneItem", b =>
                {
                    b.HasOne("MGME.Core.Entities.Scene", "Scene")
                        .WithMany("SceneItems")
                        .HasForeignKey("SceneId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Scene");
                });

            modelBuilder.Entity("MGME.Core.Entities.Thread", b =>
                {
                    b.HasOne("MGME.Core.Entities.Adventure", "Adventure")
                        .WithMany("Threads")
                        .HasForeignKey("AdventureId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("MGME.Core.Entities.PlayerCharacter", "PlayerCharacter")
                        .WithMany("Threads")
                        .HasForeignKey("PlayerCharacterId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.Navigation("Adventure");

                    b.Navigation("PlayerCharacter");
                });

            modelBuilder.Entity("MGME.Core.Entities.Adventure", b =>
                {
                    b.Navigation("Scenes");

                    b.Navigation("Threads");
                });

            modelBuilder.Entity("MGME.Core.Entities.PlayerCharacter", b =>
                {
                    b.Navigation("NonPlayerCharacters");

                    b.Navigation("Threads");
                });

            modelBuilder.Entity("MGME.Core.Entities.Scene", b =>
                {
                    b.Navigation("SceneItems");
                });

            modelBuilder.Entity("MGME.Core.Entities.SceneItem", b =>
                {
                    b.Navigation("Battle");

                    b.Navigation("FateQuestion");

                    b.Navigation("RandomEvent");
                });

            modelBuilder.Entity("MGME.Core.Entities.User", b =>
                {
                    b.Navigation("Adventures");

                    b.Navigation("NonPlayerCharacters");

                    b.Navigation("PlayerCharacters");

                    b.Navigation("RefreshTokens");
                });
#pragma warning restore 612, 618
        }
    }
}
