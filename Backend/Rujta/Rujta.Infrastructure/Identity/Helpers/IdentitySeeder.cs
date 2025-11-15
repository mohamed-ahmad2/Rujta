namespace Rujta.Infrastructure.Identity.Helpers
{
    public static class IdentitySeeder
    {
        public static async Task SeedRolesAsync(RoleManager<IdentityRole<Guid>> roleManager)
        {
            string[] roleNames = { "SuperAdmin", "PharmacyAdmin", "Pharmacist", "User", "Staff" };

            foreach (var roleName in roleNames)
            {
                if (!await roleManager.RoleExistsAsync(roleName))
                {
                    var role = new IdentityRole<Guid>(roleName)
                    {
                        Id = Guid.NewGuid(),
                        NormalizedName = roleName.ToUpperInvariant(),
                        ConcurrencyStamp = Guid.NewGuid().ToString()
                    };

                    await roleManager.CreateAsync(role);
                }
            }
        }
    }
}
