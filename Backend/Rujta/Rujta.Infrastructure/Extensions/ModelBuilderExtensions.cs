using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Identity.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Rujta.Infrastructure.Extensions
{
    public static class ModelBuilderExtensions
    {
        public static void ApplyIdentityMapping(this ModelBuilder builder)
        {
            // Discriminator mapping for Person hierarchy
            var discriminatorMapping = new Dictionary<Type, string>
            {
                { typeof(User), "User" },
                { typeof(Pharmacist), "Pharmacist" },
                { typeof(Manager), "Manager" },
                { typeof(Staff), "Staff" },
                { typeof(Admin), "Admin" }
            };

            var discriminatorBuilder = builder.Entity<Person>().HasDiscriminator<string>("Discriminator");

            foreach (var kvp in discriminatorMapping)
            {
                discriminatorBuilder.HasValue(kvp.Key, kvp.Value);
            }

            // Rename Identity tables
            var identityTables = new Dictionary<Type, string>
            {
                { typeof(Person), "Person" },
                { typeof(IdentityRole<Guid>), "Role" },
                { typeof(IdentityUserRole<Guid>), "PersonRole" },
                { typeof(IdentityUserClaim<Guid>), "PersonClaim" },
                { typeof(IdentityUserLogin<Guid>), "PersonLogin" },
                { typeof(IdentityRoleClaim<Guid>), "RoleClaim" },
                { typeof(IdentityUserToken<Guid>), "PersonToken" }
            };

            foreach (var table in identityTables)
            {
                builder.Entity(table.Key).ToTable(table.Value);
            }
        }

        public static void ApplyDecimalPrecision(this ModelBuilder builder)
        {
            var decimalProperties = new Dictionary<Type, string[]>
            {
                { typeof(InventoryItem), new[] { "Price" } },
                { typeof(Medicine), new[] { "Price" } },
                { typeof(Order), new[] { "TotalPrice" } },
                { typeof(OrderItem), new[] { "PricePerUnit", "SubTotal" } },
                { typeof(SellDrugViaPharmacy), new[] { "Price" } },
                { typeof(Staff), new[] { "Salary" } }
            };

            foreach (var entity in decimalProperties)
            {
                foreach (var prop in entity.Value)
                {
                    builder.Entity(entity.Key).Property(prop).HasPrecision(18, 2);
                }
            }
        }
    }
}
