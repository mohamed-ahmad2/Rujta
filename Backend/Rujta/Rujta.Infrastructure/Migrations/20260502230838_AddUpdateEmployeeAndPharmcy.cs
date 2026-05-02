using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUpdateEmployeeAndPharmcy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_People_CustomerId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Pharmacies_IsDeleted",
                table: "Pharmacies");

            migrationBuilder.RenameIndex(
                name: "IX_People_Customer_PharmacyId",
                table: "People",
                newName: "IX_Customers_PharmacyId");

            migrationBuilder.AlterColumn<decimal>(
                name: "Longitude",
                table: "Pharmacies",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<decimal>(
                name: "Latitude",
                table: "Pharmacies",
                type: "decimal(9,6)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Pharmacies",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Pharmacies",
                type: "datetime2",
                nullable: false,
                defaultValueSql: "GETUTCDATE()",
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AddColumn<Guid>(
                name: "ManagerId",
                table: "Pharmacies",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "ProfileImageUrl",
                table: "People",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "People",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacies_GeoLocation",
                table: "Pharmacies",
                columns: new[] { "Latitude", "Longitude" });

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacies_ManagerId_Unique",
                table: "Pharmacies",
                column: "ManagerId",
                unique: true,
                filter: "[ManagerId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacies_Name",
                table: "Pharmacies",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_People_Email",
                table: "People",
                column: "Email",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_People_CustomerId",
                table: "Orders",
                column: "CustomerId",
                principalTable: "People",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_People_ManagerId",
                table: "Pharmacies",
                column: "ManagerId",
                principalTable: "People",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_People_CustomerId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_People_ManagerId",
                table: "Pharmacies");

            migrationBuilder.DropIndex(
                name: "IX_Pharmacies_GeoLocation",
                table: "Pharmacies");

            migrationBuilder.DropIndex(
                name: "IX_Pharmacies_ManagerId_Unique",
                table: "Pharmacies");

            migrationBuilder.DropIndex(
                name: "IX_Pharmacies_Name",
                table: "Pharmacies");

            migrationBuilder.DropIndex(
                name: "IX_People_Email",
                table: "People");

            migrationBuilder.DropColumn(
                name: "ManagerId",
                table: "Pharmacies");

            migrationBuilder.RenameIndex(
                name: "IX_Customers_PharmacyId",
                table: "People",
                newName: "IX_People_Customer_PharmacyId");

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Pharmacies",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Pharmacies",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(9,6)");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "Pharmacies",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Pharmacies",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldDefaultValueSql: "GETUTCDATE()");

            migrationBuilder.AlterColumn<string>(
                name: "ProfileImageUrl",
                table: "People",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Email",
                table: "People",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(150)",
                oldMaxLength: 150);

            migrationBuilder.CreateIndex(
                name: "IX_Pharmacies_IsDeleted",
                table: "Pharmacies",
                column: "IsDeleted");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_People_CustomerId",
                table: "Orders",
                column: "CustomerId",
                principalTable: "People",
                principalColumn: "Id");
        }
    }
}
