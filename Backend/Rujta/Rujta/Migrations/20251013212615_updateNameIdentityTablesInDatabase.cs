using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Rujta.Migrations
{
    /// <inheritdoc />
    public partial class updateNameIdentityTablesInDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_User_UserID",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_User_CreatedByAdminId",
                table: "Pharmacies");

            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_User_ManagedByManagerId",
                table: "Pharmacies");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_User_PatientID",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcessPrescriptions_User_PharmacistID",
                table: "ProcessPrescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_SellDrugViaPharmacies_User_SellerID",
                table: "SellDrugViaPharmacies");

            migrationBuilder.DropForeignKey(
                name: "FK_User_Pharmacies_PharmacyID",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_User_CreatedByAdminId",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_User_User_ManagerID",
                table: "User");

            migrationBuilder.DropForeignKey(
                name: "FK_UserClaim_User_UserId",
                table: "UserClaim");

            migrationBuilder.DropForeignKey(
                name: "FK_UserLogin_User_UserId",
                table: "UserLogin");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRole_User_UserId",
                table: "UserRole");

            migrationBuilder.DropForeignKey(
                name: "FK_UserToken_User_UserId",
                table: "UserToken");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserToken",
                table: "UserToken");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRole",
                table: "UserRole");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserLogin",
                table: "UserLogin");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserClaim",
                table: "UserClaim");

            migrationBuilder.DropPrimaryKey(
                name: "PK_User",
                table: "User");

            migrationBuilder.RenameTable(
                name: "UserToken",
                newName: "PersonToken");

            migrationBuilder.RenameTable(
                name: "UserRole",
                newName: "PersonRole");

            migrationBuilder.RenameTable(
                name: "UserLogin",
                newName: "PersonLogin");

            migrationBuilder.RenameTable(
                name: "UserClaim",
                newName: "PersonClaim");

            migrationBuilder.RenameTable(
                name: "User",
                newName: "Person");

            migrationBuilder.RenameIndex(
                name: "IX_UserRole_RoleId",
                table: "PersonRole",
                newName: "IX_PersonRole_RoleId");

            migrationBuilder.RenameIndex(
                name: "IX_UserLogin_UserId",
                table: "PersonLogin",
                newName: "IX_PersonLogin_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_UserClaim_UserId",
                table: "PersonClaim",
                newName: "IX_PersonClaim_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_User_PharmacyID",
                table: "Person",
                newName: "IX_Person_PharmacyID");

            migrationBuilder.RenameIndex(
                name: "IX_User_ManagerID",
                table: "Person",
                newName: "IX_Person_ManagerID");

            migrationBuilder.RenameIndex(
                name: "IX_User_CreatedByAdminId",
                table: "Person",
                newName: "IX_Person_CreatedByAdminId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonToken",
                table: "PersonToken",
                columns: new[] { "UserId", "LoginProvider", "Name" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonRole",
                table: "PersonRole",
                columns: new[] { "UserId", "RoleId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonLogin",
                table: "PersonLogin",
                columns: new[] { "LoginProvider", "ProviderKey" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_PersonClaim",
                table: "PersonClaim",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Person",
                table: "Person",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Person_UserID",
                table: "Orders",
                column: "UserID",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Person_Person_CreatedByAdminId",
                table: "Person",
                column: "CreatedByAdminId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Person_Person_ManagerID",
                table: "Person",
                column: "ManagerID",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Person_Pharmacies_PharmacyID",
                table: "Person",
                column: "PharmacyID",
                principalTable: "Pharmacies",
                principalColumn: "PharmacyID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonClaim_Person_UserId",
                table: "PersonClaim",
                column: "UserId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonLogin_Person_UserId",
                table: "PersonLogin",
                column: "UserId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonRole_Person_UserId",
                table: "PersonRole",
                column: "UserId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonRole_Role_RoleId",
                table: "PersonRole",
                column: "RoleId",
                principalTable: "Role",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PersonToken_Person_UserId",
                table: "PersonToken",
                column: "UserId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_Person_CreatedByAdminId",
                table: "Pharmacies",
                column: "CreatedByAdminId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_Person_ManagedByManagerId",
                table: "Pharmacies",
                column: "ManagedByManagerId",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_Person_PatientID",
                table: "Prescriptions",
                column: "PatientID",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcessPrescriptions_Person_PharmacistID",
                table: "ProcessPrescriptions",
                column: "PharmacistID",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SellDrugViaPharmacies_Person_SellerID",
                table: "SellDrugViaPharmacies",
                column: "SellerID",
                principalTable: "Person",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Person_UserID",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Person_CreatedByAdminId",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Person_ManagerID",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_Person_Pharmacies_PharmacyID",
                table: "Person");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonClaim_Person_UserId",
                table: "PersonClaim");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonLogin_Person_UserId",
                table: "PersonLogin");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonRole_Person_UserId",
                table: "PersonRole");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonRole_Role_RoleId",
                table: "PersonRole");

            migrationBuilder.DropForeignKey(
                name: "FK_PersonToken_Person_UserId",
                table: "PersonToken");

            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_Person_CreatedByAdminId",
                table: "Pharmacies");

            migrationBuilder.DropForeignKey(
                name: "FK_Pharmacies_Person_ManagedByManagerId",
                table: "Pharmacies");

            migrationBuilder.DropForeignKey(
                name: "FK_Prescriptions_Person_PatientID",
                table: "Prescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_ProcessPrescriptions_Person_PharmacistID",
                table: "ProcessPrescriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_SellDrugViaPharmacies_Person_SellerID",
                table: "SellDrugViaPharmacies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonToken",
                table: "PersonToken");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonRole",
                table: "PersonRole");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonLogin",
                table: "PersonLogin");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PersonClaim",
                table: "PersonClaim");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Person",
                table: "Person");

            migrationBuilder.RenameTable(
                name: "PersonToken",
                newName: "UserToken");

            migrationBuilder.RenameTable(
                name: "PersonRole",
                newName: "UserRole");

            migrationBuilder.RenameTable(
                name: "PersonLogin",
                newName: "UserLogin");

            migrationBuilder.RenameTable(
                name: "PersonClaim",
                newName: "UserClaim");

            migrationBuilder.RenameTable(
                name: "Person",
                newName: "User");

            migrationBuilder.RenameIndex(
                name: "IX_PersonRole_RoleId",
                table: "UserRole",
                newName: "IX_UserRole_RoleId");

            migrationBuilder.RenameIndex(
                name: "IX_PersonLogin_UserId",
                table: "UserLogin",
                newName: "IX_UserLogin_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_PersonClaim_UserId",
                table: "UserClaim",
                newName: "IX_UserClaim_UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Person_PharmacyID",
                table: "User",
                newName: "IX_User_PharmacyID");

            migrationBuilder.RenameIndex(
                name: "IX_Person_ManagerID",
                table: "User",
                newName: "IX_User_ManagerID");

            migrationBuilder.RenameIndex(
                name: "IX_Person_CreatedByAdminId",
                table: "User",
                newName: "IX_User_CreatedByAdminId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserToken",
                table: "UserToken",
                columns: new[] { "UserId", "LoginProvider", "Name" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRole",
                table: "UserRole",
                columns: new[] { "UserId", "RoleId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserLogin",
                table: "UserLogin",
                columns: new[] { "LoginProvider", "ProviderKey" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserClaim",
                table: "UserClaim",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_User",
                table: "User",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_User_UserID",
                table: "Orders",
                column: "UserID",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_User_CreatedByAdminId",
                table: "Pharmacies",
                column: "CreatedByAdminId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Pharmacies_User_ManagedByManagerId",
                table: "Pharmacies",
                column: "ManagedByManagerId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Prescriptions_User_PatientID",
                table: "Prescriptions",
                column: "PatientID",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ProcessPrescriptions_User_PharmacistID",
                table: "ProcessPrescriptions",
                column: "PharmacistID",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SellDrugViaPharmacies_User_SellerID",
                table: "SellDrugViaPharmacies",
                column: "SellerID",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_User_Pharmacies_PharmacyID",
                table: "User",
                column: "PharmacyID",
                principalTable: "Pharmacies",
                principalColumn: "PharmacyID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_User_CreatedByAdminId",
                table: "User",
                column: "CreatedByAdminId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_User_User_ManagerID",
                table: "User",
                column: "ManagerID",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserClaim_User_UserId",
                table: "UserClaim",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserLogin_User_UserId",
                table: "UserLogin",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_Role_RoleId",
                table: "UserRole",
                column: "RoleId",
                principalTable: "Role",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRole_User_UserId",
                table: "UserRole",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserToken_User_UserId",
                table: "UserToken",
                column: "UserId",
                principalTable: "User",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
