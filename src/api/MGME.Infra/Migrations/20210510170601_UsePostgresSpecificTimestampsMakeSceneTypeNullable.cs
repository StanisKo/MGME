using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace MGME.Infra.Migrations
{
    public partial class UsePostgresSpecificTimestampsMakeSceneTypeNullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Scenes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Scenes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(3180));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SceneItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(4950));

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Adventures",
                type: "timestamp without time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 739, DateTimeKind.Utc).AddTicks(1390));
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "Type",
                table: "Scenes",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Scenes",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(3180),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "SceneItems",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 740, DateTimeKind.Utc).AddTicks(4950),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Adventures",
                type: "timestamp without time zone",
                nullable: false,
                defaultValue: new DateTime(2021, 5, 10, 16, 2, 8, 739, DateTimeKind.Utc).AddTicks(1390),
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone",
                oldDefaultValueSql: "NOW()");
        }
    }
}
