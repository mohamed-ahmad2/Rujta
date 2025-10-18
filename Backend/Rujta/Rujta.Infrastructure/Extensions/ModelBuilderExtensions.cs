using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Identity.Entities;
using Microsoft.AspNetCore.Identity;

namespace Rujta.Infrastructure.Extensions
{
    public static class ModelBuilderExtensions
    {
        public static void ApplyIdentityMapping(this ModelBuilder builder)
        {
            builder.Entity<Person>()
                .HasDiscriminator<string>("Discriminator")
                .HasValue<User>("User")
                .HasValue<Pharmacist>("Pharmacist")
                .HasValue<Manager>("Manager")
                .HasValue<Staff>("Staff")
                .HasValue<Admin>("Admin");

            List<IdentityRole<Guid>> identityRoles = new List<IdentityRole<Guid>>
            {
                new IdentityRole<Guid> {
                    Id = Guid.NewGuid(),
                    Name = "User",
                    NormalizedName = "USER",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole<Guid> {
                    Id = Guid.NewGuid(),
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole<Guid> {
                    Id = Guid.NewGuid(),
                    Name = "Staff",
                    NormalizedName = "STAFF",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole<Guid> {
                    Id = Guid.NewGuid(),
                    Name = "Manager",
                    NormalizedName = "MANAGER",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                }
            };
            builder.Entity<IdentityRole<Guid>>().HasData(identityRoles);

            // Rename Identity Tables
            builder.Entity<Person>().ToTable("Person");
            builder.Entity<IdentityRole<Guid>>().ToTable("Role");
            builder.Entity<IdentityUserRole<Guid>>().ToTable("PersonRole");
            builder.Entity<IdentityUserClaim<Guid>>().ToTable("PersonClaim");
            builder.Entity<IdentityUserLogin<Guid>>().ToTable("PersonLogin");
            builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaim");
            builder.Entity<IdentityUserToken<Guid>>().ToTable("PersonToken");
        }

        public static void ApplyDecimalPrecision(this ModelBuilder builder)
        {
            builder.Entity<InventoryItem>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Medicine>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Order>().Property(p => p.TotalPrice).HasPrecision(18, 2);
            builder.Entity<OrderItem>().Property(p => p.PricePerUnit).HasPrecision(18, 2);
            builder.Entity<OrderItem>().Property(p => p.SubTotal).HasPrecision(18, 2);
            builder.Entity<SellDrugViaPharmacy>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Staff>().Property(p => p.Salary).HasPrecision(18, 2);
        }
    }
}
