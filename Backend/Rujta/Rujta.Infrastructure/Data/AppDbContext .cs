using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Identity.Entities;

namespace Rujta.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<Person, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Person table
        public DbSet<User> UsersExtended { get; set; }
        public DbSet<Pharmacist> Pharmacists { get; set; }
        public DbSet<Manager> Managers { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Admin> Admins { get; set; }

        // Entities
        public DbSet<Pharmacy> Pharmacies { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<ProcessPrescription> ProcessPrescriptions { get; set; }
        public DbSet<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Inheritance Mapping 
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


            // Decimal Precision 
            builder.Entity<InventoryItem>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Medicine>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Order>().Property(p => p.TotalPrice).HasPrecision(18, 2);
            builder.Entity<OrderItem>().Property(p => p.PricePerUnit).HasPrecision(18, 2);
            builder.Entity<OrderItem>().Property(p => p.SubTotal).HasPrecision(18, 2);
            builder.Entity<SellDrugViaPharmacy>().Property(p => p.Price).HasPrecision(18, 2);
            builder.Entity<Staff>().Property(p => p.Salary).HasPrecision(18, 2);

            // Pharmacy Relationships 
            builder.Entity<Pharmacy>()
                .HasOne(p => p.ParentPharmacy)
                .WithMany()
                .HasForeignKey(p => p.ParentPharmacyID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Pharmacy>()
                .HasOne<Admin>()
                .WithMany()
                .HasForeignKey(p => p.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Pharmacy>()
                .HasOne<Manager>()
                .WithMany()
                .HasForeignKey(p => p.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Manager>()
                .HasOne(m => m.Admin)
                .WithMany()
                .HasForeignKey(m => m.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Staff>()
                .HasOne(s => s.Manager)
                .WithMany()
                .HasForeignKey(s => s.ManagerID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Staff>()
                .HasOne(s => s.Pharmacy)
                .WithMany()
                .HasForeignKey(s => s.PharmacyID)
                .OnDelete(DeleteBehavior.Restrict);

            //  ProcessPrescription Relationships 
            builder.Entity<ProcessPrescription>()
                .HasOne<Pharmacist>()
                .WithMany()
                .HasForeignKey(pp => pp.PharmacistID)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.Entity<ProcessPrescription>()
                .HasOne(pp => pp.Prescription)
                .WithMany()
                .HasForeignKey(pp => pp.PrescriptionID)
                .OnDelete(DeleteBehavior.Cascade); 
        }


        public override int SaveChanges()
        {
            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                if (entry.State == EntityState.Added)
                    entry.Entity.CreatedAt = DateTime.UtcNow;

                if (entry.State == EntityState.Modified)
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
            }

            return base.SaveChanges();
        }

    }
}
