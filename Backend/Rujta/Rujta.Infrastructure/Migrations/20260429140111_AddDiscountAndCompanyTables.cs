using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDiscountAndCompanyTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyName",
                table: "Medicines");

            migrationBuilder.AddColumn<int>(
                name: "CompanyId",
                table: "Medicines",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Company",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Company", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Medicines_CompanyId",
                table: "Medicines",
                column: "CompanyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Medicines_Company_CompanyId",
                table: "Medicines",
                column: "CompanyId",
                principalTable: "Company",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Medicines_Company_CompanyId",
                table: "Medicines");

            migrationBuilder.DropTable(
                name: "Company");

            migrationBuilder.DropIndex(
                name: "IX_Medicines_CompanyId",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Medicines");

            migrationBuilder.AddColumn<string>(
                name: "CompanyName",
                table: "Medicines",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
