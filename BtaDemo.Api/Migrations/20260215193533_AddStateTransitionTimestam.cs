using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BtaDemo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStateTransitionTimestam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CompletedAtUtc",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartedAtUtc",
                table: "Jobs",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "OverdueAtUtc",
                table: "Invoices",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedAtUtc",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "StartedAtUtc",
                table: "Jobs");

            migrationBuilder.DropColumn(
                name: "OverdueAtUtc",
                table: "Invoices");
        }
    }
}
