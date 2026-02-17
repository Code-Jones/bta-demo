using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BtaDemo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadStatusAndInvoiceDueAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "LostAtUtc",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Status",
                table: "Leads",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAtUtc",
                table: "Leads",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "now()");

            migrationBuilder.Sql("UPDATE \"Leads\" SET \"UpdatedAtUtc\" = \"CreatedAtUtc\" WHERE \"UpdatedAtUtc\" IS NULL OR \"UpdatedAtUtc\" = '0001-01-01 00:00:00+00';");

            migrationBuilder.AddColumn<DateTime>(
                name: "DueAtUtc",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LostAtUtc",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "UpdatedAtUtc",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "DueAtUtc",
                table: "Invoices");
        }
    }
}
