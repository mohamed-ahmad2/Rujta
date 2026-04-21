using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ads : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
           

            migrationBuilder.CreateTable(
                name: "Ads",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PharmacyId = table.Column<int>(type: "int", nullable: false),
                    TemplateName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Badge = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdMode = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MedicineId = table.Column<int>(type: "int", nullable: true),
                    MedicineName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MedicineImage = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Headline = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Subtext = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CtaLabel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColorFrom = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColorTo = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ColorAccent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FontLabel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                }
               

            );

          

            migrationBuilder.CreateIndex(
                name: "IX_Ads_PharmacyId",
                table: "Ads",
                column: "PharmacyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Ads_Pharmacies_PharmacyId",
                table: "Ads",
                column: "PharmacyId",
                principalTable: "Pharmacies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            
           
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_People_AdminId",
                table: "Pharmacies");

            
            migrationBuilder.DropTable(
                name: "Ads");

        }
    }
}
