using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rujta.Models;

namespace Rujta.Data
{
    public class AppDbContext : IdentityDbContext<Person, IdentityRole, string>
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

            List<IdentityRole> identityRoles = new List<IdentityRole>()
            {
                new IdentityRole{
                    Name = "User",
                    NormalizedName = "USER",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole{
                    Name = "Admin",
                    NormalizedName = "ADMIN",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole{
                    Name = "Staff",
                    NormalizedName = "STAFF",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
                new IdentityRole{
                    Name = "Manager",
                    NormalizedName = "MANAGER",
                    ConcurrencyStamp = Guid.NewGuid().ToString()
                },
            };

            builder.Entity<IdentityRole>().HasData(identityRoles);

            // Rename Identity Tables 
            builder.Entity<Person>().ToTable("Person");
            builder.Entity<IdentityRole>().ToTable("Role");
            builder.Entity<IdentityUserRole<string>>().ToTable("PersonRole");
            builder.Entity<IdentityUserClaim<string>>().ToTable("PersonClaim");
            builder.Entity<IdentityUserLogin<string>>().ToTable("PersonLogin");
            builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaim");
            builder.Entity<IdentityUserToken<string>>().ToTable("PersonToken");

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
                .HasOne(p => p.Admin)
                .WithMany()
                .HasForeignKey(p => p.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Pharmacy>()
                .HasOne(p => p.Manager)
                .WithMany()
                .HasForeignKey(p => p.ManagedByManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Manager>()
                .HasOne(m => m.Admin)
                .WithMany()
                .HasForeignKey(m => m.CreatedByAdminId)
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
                .HasOne(pp => pp.Pharmacist)
                .WithMany()
                .HasForeignKey(pp => pp.PharmacistID)
                .OnDelete(DeleteBehavior.Restrict); 

            builder.Entity<ProcessPrescription>()
                .HasOne(pp => pp.Prescription)
                .WithMany()
                .HasForeignKey(pp => pp.PrescriptionID)
                .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}
