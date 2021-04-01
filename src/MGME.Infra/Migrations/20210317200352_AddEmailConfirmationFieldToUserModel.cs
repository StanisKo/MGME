using Microsoft.EntityFrameworkCore.Migrations;

namespace MGME.Infra.Migrations
{
    public partial class AddEmailConfirmationFieldToUserModel : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "EmailIsConfirmed",
                table: "Users",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailIsConfirmed",
                table: "Users");
        }
    }
}
