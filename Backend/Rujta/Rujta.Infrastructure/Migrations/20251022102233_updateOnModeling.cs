using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rujta.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class updateOnModeling : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Pharmacies",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Pharmacies",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "People",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "People",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "People",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "People",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProfileImageUrl",
                table: "People",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Pharmacies");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Pharmacies");

            migrationBuilder.DropColumn(
                name: "Email",
                table: "People");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "People");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "People");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "People");

            migrationBuilder.DropColumn(
                name: "ProfileImageUrl",
                table: "People");
        }
    }
}
