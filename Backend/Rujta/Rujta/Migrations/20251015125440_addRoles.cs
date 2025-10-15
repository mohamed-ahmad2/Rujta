using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Rujta.Migrations
{
    /// <inheritdoc />
    public partial class addRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "00d288c0-a935-496c-a9af-98ee0e927f7a", null, "Staff", "STAFF" },
                    { "455241de-a717-4e59-843e-a34504c0774e", null, "Admin", "ADMIN" },
                    { "bd8cad9e-a970-423c-a5c9-4de8948a3e51", null, "Manager", "MANAGER" },
                    { "c3cd465c-e506-4ade-ae6c-125cc832e614", null, "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "00d288c0-a935-496c-a9af-98ee0e927f7a");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "455241de-a717-4e59-843e-a34504c0774e");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "bd8cad9e-a970-423c-a5c9-4de8948a3e51");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "c3cd465c-e506-4ade-ae6c-125cc832e614");
        }
    }
}
