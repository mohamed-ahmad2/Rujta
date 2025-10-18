using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updateOnModeling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("6cb5f5ee-8cc8-4f06-8954-cdddea829edb"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("7d5022cb-94dc-4d05-8557-608d3c5050e1"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("db07f611-8e81-41eb-ad90-4fae04103d1d"));

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: new Guid("ecd4b66e-4e19-4a54-bed5-e813497f41bc"));

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { new Guid("6cb5f5ee-8cc8-4f06-8954-cdddea829edb"), "a45591b7-fa70-407b-8931-e80efddf87a7", "Staff", "STAFF" },
                    { new Guid("7d5022cb-94dc-4d05-8557-608d3c5050e1"), "fbca5a39-27be-4560-a58a-12fe591f5ac5", "Admin", "ADMIN" },
                    { new Guid("db07f611-8e81-41eb-ad90-4fae04103d1d"), "dfcc8efb-2e61-4a33-9c13-ff4e980a354a", "User", "USER" },
                    { new Guid("ecd4b66e-4e19-4a54-bed5-e813497f41bc"), "35695dab-b5e8-4522-a4e7-15074757484e", "Manager", "MANAGER" }
                });
        }
    }
}
