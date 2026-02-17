using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BtaDemo.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLeadDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressLine1",
                table: "Leads",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AddressLine2",
                table: "Leads",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "City",
                table: "Leads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedValue",
                table: "Leads",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeadSource",
                table: "Leads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "Leads",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PostalCode",
                table: "Leads",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProjectType",
                table: "Leads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "State",
                table: "Leads",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AddressLine1",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "AddressLine2",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "City",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "EstimatedValue",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "LeadSource",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "PostalCode",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "ProjectType",
                table: "Leads");

            migrationBuilder.DropColumn(
                name: "State",
                table: "Leads");
        }
    }
}
