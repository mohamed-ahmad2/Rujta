using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Rujta.Migrations
{
    /// <inheritdoc />
    public partial class addConcurrencyStampForRoles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
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

            migrationBuilder.InsertData(
                table: "Role",
                columns: new[] { "Id", "ConcurrencyStamp", "Name", "NormalizedName" },
                values: new object[,]
                {
                    { "22a8f261-f8d4-424e-b1a2-58bf7fdaa5eb", "323c6856-6398-4b08-babb-b1560dcdd8eb", "Staff", "STAFF" },
                    { "45bc5021-f81b-426a-8fcb-ebcd416b91c3", "1739d064-eece-4d69-b766-f4a1eb38cd0b", "Admin", "ADMIN" },
                    { "ae1e5168-472b-474a-9ccc-582f652aaaa9", "a83d93fa-35a2-439d-bfc1-1ac1f5a62acc", "Manager", "MANAGER" },
                    { "fe7572b9-abc8-4d9c-85a5-5335448db43b", "e2bf7114-adc0-4f9b-a578-0ab7aa3facc6", "User", "USER" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "22a8f261-f8d4-424e-b1a2-58bf7fdaa5eb");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "45bc5021-f81b-426a-8fcb-ebcd416b91c3");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "ae1e5168-472b-474a-9ccc-582f652aaaa9");

            migrationBuilder.DeleteData(
                table: "Role",
                keyColumn: "Id",
                keyValue: "fe7572b9-abc8-4d9c-85a5-5335448db43b");

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
    }
}
