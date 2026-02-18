using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BtaDemo.Api.Migrations
{
    /// <inheritdoc />
    [Migration("20260218100000_AddOrganizationForeignKeys")]
    public partial class AddOrganizationForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Estimates_OrganizationId",
                table: "Estimates",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Jobs_OrganizationId",
                table: "Jobs",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_Invoices_OrganizationId",
                table: "Invoices",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_JobExpenses_OrganizationId",
                table: "JobExpenses",
                column: "OrganizationId");

            migrationBuilder.AddForeignKey(
                name: "FK_Estimates_Organizations_OrganizationId",
                table: "Estimates",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Jobs_Organizations_OrganizationId",
                table: "Jobs",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Invoices_Organizations_OrganizationId",
                table: "Invoices",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobExpenses_Organizations_OrganizationId",
                table: "JobExpenses",
                column: "OrganizationId",
                principalTable: "Organizations",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Estimates_Organizations_OrganizationId",
                table: "Estimates");

            migrationBuilder.DropForeignKey(
                name: "FK_Jobs_Organizations_OrganizationId",
                table: "Jobs");

            migrationBuilder.DropForeignKey(
                name: "FK_Invoices_Organizations_OrganizationId",
                table: "Invoices");

            migrationBuilder.DropForeignKey(
                name: "FK_JobExpenses_Organizations_OrganizationId",
                table: "JobExpenses");

            migrationBuilder.DropIndex(
                name: "IX_Estimates_OrganizationId",
                table: "Estimates");

            migrationBuilder.DropIndex(
                name: "IX_Jobs_OrganizationId",
                table: "Jobs");

            migrationBuilder.DropIndex(
                name: "IX_Invoices_OrganizationId",
                table: "Invoices");

            migrationBuilder.DropIndex(
                name: "IX_JobExpenses_OrganizationId",
                table: "JobExpenses");
        }
    }
}
