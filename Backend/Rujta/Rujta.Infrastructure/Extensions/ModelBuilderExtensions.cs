using Rujta.Domain.Common;
using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Extensions
{
    public static class ModelBuilderExtensions
    {
        public static void ApplyIdentityMapping(this ModelBuilder builder)
        {
            var discriminatorMapping = new Dictionary<Type, string>
            {
                { typeof(User),       "User" },
                { typeof(Employee),   "Employee" },
                { typeof(Manager),    "Manager" },
                { typeof(Pharmacist), "Pharmacist" },
                { typeof(Admin),      "Admin" },
                { typeof(Customer),   "Customer" }
            };

            var discriminatorBuilder = builder.Entity<Person>()
                .HasDiscriminator<string>("Discriminator");

            foreach (var kvp in discriminatorMapping)
            {
                discriminatorBuilder.HasValue(kvp.Key, kvp.Value);
            }

            var identityTables = new Dictionary<Type, string>
            {
                { typeof(ApplicationUser),          "AspNetUsers" },
                { typeof(IdentityRole<Guid>),       "Roles" },
                { typeof(IdentityUserRole<Guid>),   "UserRoles" },
                { typeof(IdentityUserClaim<Guid>),  "UserClaims" },
                { typeof(IdentityUserLogin<Guid>),  "UserLogins" },
                { typeof(IdentityRoleClaim<Guid>),  "RoleClaims" },
                { typeof(IdentityUserToken<Guid>),  "UserTokens" }
            };

            foreach (var table in identityTables)
            {
                builder.Entity(table.Key).ToTable(table.Value);
            }
        }



        public static void ApplyDecimalPrecision(this ModelBuilder builder)
        {
            var decimalProperties = builder.Model
                .GetEntityTypes()
                .SelectMany(entityType => entityType.ClrType.GetProperties()
                    .Where(p => p.PropertyType == typeof(decimal)
                             || p.PropertyType == typeof(decimal?))
                    .Select(p => new { EntityType = entityType.ClrType, Property = p }));

            foreach (var item in decimalProperties)
            {
                var propertyBuilder = builder.Entity(item.EntityType)
                                             .Property(item.Property.Name);

                if (propertyBuilder.Metadata.GetPrecision() == null)
                {
                    propertyBuilder.HasPrecision(18, 2);
                }
            }

            var customDecimalPrecisions = new Dictionary<Type, Dictionary<string, (int Precision, int Scale)>>
            {
                { typeof(InventoryItem),       new() { { "Price", (10, 2) } } },
                { typeof(Medicine),            new() { { "Price", (10, 2) } } },
                { typeof(Order),               new() { { "TotalPrice", (12, 2) } } },
                { typeof(OrderItem),           new() { { "PricePerUnit", (10, 2) }, { "SubTotal", (12, 2) } } },
                { typeof(SellDrugViaPharmacy), new() { { "Price", (10, 2) } } },
                { typeof(Pharmacist),          new() { { "Salary", (10, 2) } } },
                { typeof(Ad),                  new() { { "Price", (10, 2) } } },
                { typeof(Payment),             new() { { "Amount", (12, 2) } } },
                { typeof(Discount),            new() { { "Value", (10, 2) } } }
            };

            var customConfigs = customDecimalPrecisions
                .SelectMany(entity => entity.Value.Select(prop => new
                {
                    EntityType = entity.Key,
                    PropertyName = prop.Key,
                    prop.Value.Precision,
                    prop.Value.Scale
                }));

            foreach (var config in customConfigs)
            {
                builder.Entity(config.EntityType)
                       .Property(config.PropertyName)
                       .HasPrecision(config.Precision, config.Scale);
            }
        }
    }
}