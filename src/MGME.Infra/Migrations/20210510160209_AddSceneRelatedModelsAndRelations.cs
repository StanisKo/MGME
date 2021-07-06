using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

namespace MGME.Infra.Migrations
{
    public partial class AddSceneRelatedModelsAndRelations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Adventures",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 739, DateTimeKind.Utc).AddTicks(1390),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValue: new DateTime(2021, 5, 7, 15, 52, 30, 471, DateTimeKind.Local).AddTicks(7040));

            migrationBuilder.CreateTable(
                name: "Scenes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Setup = table.Column<string>(type: "text", nullable: false),
                    InterruptEvent = table.Column<string>(type: "text", nullable: true),
                    ModifiedSetup = table.Column<string>(type: "text", nullable: true),
                    Resolved = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(3180)),
                    AdventureId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Scenes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Scenes_Adventures_AdventureId",
                        column: x => x.AdventureId,
                        principalTable: "Adventures",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SceneItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false, defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(4950)),
                    SceneId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SceneItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SceneItems_Scenes_SceneId",
                        column: x => x.SceneId,
                        principalTable: "Scenes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Battles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Outcome = table.Column<string>(type: "text", nullable: false),
                    SceneItemId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Battles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Battles_SceneItems_SceneItemId",
                        column: x => x.SceneItemId,
                        principalTable: "SceneItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FateQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Question = table.Column<string>(type: "text", nullable: false),
                    Answer = table.Column<bool>(type: "boolean", nullable: false),
                    Interpretation = table.Column<string>(type: "text", nullable: true),
                    SceneItemId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FateQuestions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FateQuestions_SceneItems_SceneItemId",
                        column: x => x.SceneItemId,
                        principalTable: "SceneItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RandomEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Focus = table.Column<int>(type: "integer", nullable: false),
                    Meaning = table.Column<int>(type: "integer", nullable: false),
                    Interpetation = table.Column<string>(type: "text", nullable: true),
                    SceneItemId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RandomEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RandomEvents_SceneItems_SceneItemId",
                        column: x => x.SceneItemId,
                        principalTable: "SceneItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Battles_SceneItemId",
                table: "Battles",
                column: "SceneItemId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FateQuestions_SceneItemId",
                table: "FateQuestions",
                column: "SceneItemId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RandomEvents_SceneItemId",
                table: "RandomEvents",
                column: "SceneItemId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SceneItems_SceneId",
                table: "SceneItems",
                column: "SceneId");

            migrationBuilder.CreateIndex(
                name: "IX_Scenes_AdventureId_Title",
                table: "Scenes",
                columns: new[] { "AdventureId", "Title" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Battles");

            migrationBuilder.DropTable(
                name: "FateQuestions");

            migrationBuilder.DropTable(
                name: "RandomEvents");

            migrationBuilder.DropTable(
                name: "SceneItems");

            migrationBuilder.DropTable(
                name: "Scenes");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Adventures",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(2021, 5, 7, 15, 52, 30, 471, DateTimeKind.Local).AddTicks(7040),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 739, DateTimeKind.Utc).AddTicks(1390));
        }
    }
}
