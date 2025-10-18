using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updateExtensions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("3fcdee06-5b92-46e8-8597-897871b77447"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("48c8bf5c-acca-4b17-af04-41cda18f00d8"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("a3c6d14e-6ed1-453b-ae8d-534a03219ca8"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("f30eb326-0db2-4022-b436-2c2afa192ff8"));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("3fcdee06-5b92-46e8-8597-897871b77447"), "606ea81c-91ca-468b-9005-f31e3e665dba", "User", "USER" },
                    { new Guid("48c8bf5c-acca-4b17-af04-41cda18f00d8"), "b036d0f4-3097-47e9-9bc9-0fb6a6069773", "Manager", "MANAGER" },
                    { new Guid("a3c6d14e-6ed1-453b-ae8d-534a03219ca8"), "59b9094f-9e95-411e-9a4e-073f7c4410eb", "Admin", "ADMIN" },
                    { new Guid("f30eb326-0db2-4022-b436-2c2afa192ff8"), "e13ba26c-e5e3-4280-9243-c000b0d3d752", "Staff", "STAFF" }
                });
        }
    }
}
