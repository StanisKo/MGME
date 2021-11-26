using Microsoft.EntityFrameworkCore.Migrations;

namespace MGME.Infra.Migrations
{
    public partial class RemoveUserThreadConstraintAndAddDifferentIndexesInstead : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Threads_Users_UserId",
                table: "Threads");

            migrationBuilder.DropIndex(
                name: "IX_Threads_AdventureId",
                table: "Threads");

            migrationBuilder.DropIndex(
                name: "IX_Threads_PlayerCharacterId",
                table: "Threads");

            migrationBuilder.DropIndex(
                name: "IX_Threads_UserId_Name",
                table: "Threads");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Threads");

            migrationBuilder.CreateIndex(
                name: "IX_Threads_AdventureId_Name",
                table: "Threads",
                columns: new[] { "AdventureId", "Name" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Threads_PlayerCharacterId_Name",
                table: "Threads",
                columns: new[] { "PlayerCharacterId", "Name" },
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Threads_AdventureId_Name",
                table: "Threads");

            migrationBuilder.DropIndex(
                name: "IX_Threads_PlayerCharacterId_Name",
                table: "Threads");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Threads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

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

            migrationBuilder.AddForeignKey(
                name: "FK_Threads_Users_UserId",
                table: "Threads",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
