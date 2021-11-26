using Microsoft.EntityFrameworkCore.Migrations;

namespace MGME.Infra.Migrations
{
    public partial class ChangeRandomEventFieldNameOnSceneMergeEventFocusAndEventMeaningIntoOneField : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Focus",
                table: "RandomEvents");

            migrationBuilder.RenameColumn(
                name: "InterruptEvent",
                table: "Scenes",
                newName: "RandomEvent");

            migrationBuilder.RenameColumn(
                name: "Meaning",
                table: "RandomEvents",
                newName: "Description");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "RandomEvent",
                table: "Scenes",
                newName: "InterruptEvent");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "RandomEvents",
                newName: "Meaning");

            migrationBuilder.AddColumn<string>(
                name: "Focus",
                table: "RandomEvents",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
