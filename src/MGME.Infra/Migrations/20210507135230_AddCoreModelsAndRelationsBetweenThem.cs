using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MGME.Infra.Migrations
{
    public partial class AddCoreModelsAndRelationsBetweenThem : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "GameMaster",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true,
                oldDefaultValue: "GameMaster");

            migrationBuilder.CreateTable(
                name: "Adventures",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Context = table.Column<string>(type: "text", nullable: false),
                    ChaosFactor = table.Column<int>(type: "integer", nullable: false, defaultValue: 5),
                    Resolved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValue: new DateTime(2021, 5, 7, 15, 52, 30, 471, DateTimeKind.Local).AddTicks(7040)),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Adventures", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Adventures_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PlayerCharacters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayerCharacters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayerCharacters_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdventurePlayerCharacter",
                columns: table => new
                {
                    AdventuresId = table.Column<int>(type: "integer", nullable: false),
                    PlayerCharactersId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdventurePlayerCharacter", x => new { x.AdventuresId, x.PlayerCharactersId });
                    table.ForeignKey(
                        name: "FK_AdventurePlayerCharacter_Adventures_AdventuresId",
                        column: x => x.AdventuresId,
                        principalTable: "Adventures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdventurePlayerCharacter_PlayerCharacters_PlayerCharactersId",
                        column: x => x.PlayerCharactersId,
                        principalTable: "PlayerCharacters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "NonPlayerCharacters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PlayerCharacterId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NonPlayerCharacters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_NonPlayerCharacters_PlayerCharacters_PlayerCharacterId",
                        column: x => x.PlayerCharacterId,
                        principalTable: "PlayerCharacters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_NonPlayerCharacters_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Threads",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    PlayerCharacterId = table.Column<int>(type: "integer", nullable: true),
                    AdventureId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Threads", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Threads_Adventures_AdventureId",
                        column: x => x.AdventureId,
                        principalTable: "Adventures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Threads_PlayerCharacters_PlayerCharacterId",
                        column: x => x.PlayerCharacterId,
                        principalTable: "PlayerCharacters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Threads_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdventureNonPlayerCharacter",
                columns: table => new
                {
                    AdventuresId = table.Column<int>(type: "integer", nullable: false),
                    NonPlayerCharactersId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdventureNonPlayerCharacter", x => new { x.AdventuresId, x.NonPlayerCharactersId });
                    table.ForeignKey(
                        name: "FK_AdventureNonPlayerCharacter_Adventures_AdventuresId",
                        column: x => x.AdventuresId,
                        principalTable: "Adventures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AdventureNonPlayerCharacter_NonPlayerCharacters_NonPlayerCh~",
                        column: x => x.NonPlayerCharactersId,
                        principalTable: "NonPlayerCharacters",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdventureNonPlayerCharacter_NonPlayerCharactersId",
                table: "AdventureNonPlayerCharacter",
                column: "NonPlayerCharactersId");

            migrationBuilder.CreateIndex(
                name: "IX_AdventurePlayerCharacter_PlayerCharactersId",
                table: "AdventurePlayerCharacter",
                column: "PlayerCharactersId");

            migrationBuilder.CreateIndex(
                name: "IX_Adventures_UserId_Title",
                table: "Adventures",
                columns: new[] { "UserId", "Title" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NonPlayerCharacters_PlayerCharacterId",
                table: "NonPlayerCharacters",
                column: "PlayerCharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_NonPlayerCharacters_UserId_Name",
                table: "NonPlayerCharacters",
                columns: new[] { "UserId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlayerCharacters_UserId_Name",
                table: "PlayerCharacters",
                columns: new[] { "UserId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Threads_AdventureId",
                table: "Threads",
                column: "AdventureId");

            migrationBuilder.CreateIndex(
                name: "IX_Threads_PlayerCharacterId",
                table: "Threads",
                column: "PlayerCharacterId");

            migrationBuilder.CreateIndex(
                name: "IX_Threads_UserId_Name",
                table: "Threads",
                columns: new[] { "UserId", "Name" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdventureNonPlayerCharacter");

            migrationBuilder.DropTable(
                name: "AdventurePlayerCharacter");

            migrationBuilder.DropTable(
                name: "Threads");

            migrationBuilder.DropTable(
                name: "NonPlayerCharacters");

            migrationBuilder.DropTable(
                name: "Adventures");

            migrationBuilder.DropTable(
                name: "PlayerCharacters");

            migrationBuilder.AlterColumn<string>(
                name: "Role",
                table: "Users",
                type: "text",
                nullable: true,
                defaultValue: "GameMaster",
                oldClrType: typeof(string),
                oldType: "text",
                oldDefaultValue: "GameMaster");
        }
    }
}
