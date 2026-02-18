using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BtaDemo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Organizations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Organizations", x => x.Id);
                });

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Leads",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Jobs",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "JobExpenses",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Invoices",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Estimates",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "Companies",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCompanyAdmin",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<Guid>(
                name: "OrganizationId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: true);

            migrationBuilder.Sql(@"
INSERT INTO ""Organizations"" (""Id"", ""Name"", ""CreatedAtUtc"", ""UpdatedAtUtc"")
SELECT '11111111-1111-1111-1111-111111111111',
       COALESCE((SELECT ""Company"" FROM ""AspNetUsers"" WHERE ""Company"" IS NOT NULL AND ""Company"" <> '' ORDER BY ""Id"" LIMIT 1), 'Default Organization'),
       NOW(),
       NOW()
WHERE NOT EXISTS (SELECT 1 FROM ""Organizations"");

UPDATE ""AspNetUsers"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""Companies"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""Leads"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""Estimates"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""Jobs"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""Invoices"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
UPDATE ""JobExpenses"" SET ""OrganizationId"" = '11111111-1111-1111-1111-111111111111' WHERE ""OrganizationId"" IS NULL;
");

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "AspNetUsers",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "Companies",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "Leads",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "Estimates",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "Jobs",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "Invoices",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "OrganizationId",
                table: "JobExpenses",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.DropColumn(
                name: "Company",
                table: "AspNetUsers");

            migrationBuilder.CreateIndex(
                name: "IX_Leads_OrganizationId",
                table: "Leads",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_OrganizationId",
                table: "Companies",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_OrganizationId",
                table: "AspNetUsers",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Organizations_OrganizationId",
                table: "AspNetUsers",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Organizations_OrganizationId",
                table: "Companies",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Leads_Organizations_OrganizationId",
                table: "Leads",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Organizations_OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Organizations_OrganizationId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_Leads_Organizations_OrganizationId",
                table: "Leads");

            migrationBuilder.DropTable(
                name: "Organizations");

            migrationBuilder.DropIndex(
                name: "IX_Leads_OrganizationId",
                table: "Leads");

            migrationBuilder.DropIndex(
                name: "IX_Companies_OrganizationId",
                table: "Companies");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "JobExpenses");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Invoices");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Estimates");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "IsCompanyAdmin",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "Company",
                table: "AspNetUsers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
