using Microsoft.EntityFrameworkCore.Migrations;

namespace MGME.Infra.Migrations
{
    public partial class AddRollResultFieldToFateQuestionAsDiscoveredWhenBuildingFlow : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "RollResult",
                table: "FateQuestions",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RollResult",
                table: "FateQuestions");
        }
    }
}
