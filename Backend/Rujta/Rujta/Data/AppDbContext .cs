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

        // Entities
        public DbSet<User> UsersExtended { get; set; }
        public DbSet<Pharmacist> Pharmacists { get; set; }
        public DbSet<Manager> Managers { get; set; }
        public DbSet<Staff> Staffs { get; set; }
        public DbSet<Admin> Admins { get; set; }

        public DbSet<Pharmacy> Pharmacies { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<ProcessPrescription> ProcessPrescriptions { get; set; }
        public DbSet<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Inheritance Mapping 
            modelBuilder.Entity<Person>()
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

            modelBuilder.Entity<IdentityRole>().HasData(identityRoles);

            // Rename Identity Tables 
            modelBuilder.Entity<Person>().ToTable("Person");
            modelBuilder.Entity<IdentityRole>().ToTable("Role");
            modelBuilder.Entity<IdentityUserRole<string>>().ToTable("PersonRole");
            modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("PersonClaim");
            modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("PersonLogin");
            modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaim");
            modelBuilder.Entity<IdentityUserToken<string>>().ToTable("PersonToken");

            // Decimal Precision 
            modelBuilder.Entity<InventoryItem>().Property(p => p.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Medicine>().Property(p => p.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Order>().Property(p => p.TotalPrice).HasPrecision(18, 2);
            modelBuilder.Entity<OrderItem>().Property(p => p.PricePerUnit).HasPrecision(18, 2);
            modelBuilder.Entity<OrderItem>().Property(p => p.SubTotal).HasPrecision(18, 2);
            modelBuilder.Entity<SellDrugViaPharmacy>().Property(p => p.Price).HasPrecision(18, 2);
            modelBuilder.Entity<Staff>().Property(p => p.Salary).HasPrecision(18, 2);

            // Pharmacy Relationships 
            modelBuilder.Entity<Pharmacy>()
                .HasOne(p => p.ParentPharmacy)
                .WithMany()
                .HasForeignKey(p => p.ParentPharmacyID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pharmacy>()
                .HasOne(p => p.Admin)
                .WithMany()
                .HasForeignKey(p => p.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pharmacy>()
                .HasOne(p => p.Manager)
                .WithMany()
                .HasForeignKey(p => p.ManagedByManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Manager>()
                .HasOne(m => m.Admin)
                .WithMany()
                .HasForeignKey(m => m.CreatedByAdminId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Staff>()
                .HasOne(s => s.Manager)
                .WithMany()
                .HasForeignKey(s => s.ManagerID)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Staff>()
                .HasOne(s => s.Pharmacy)
                .WithMany()
                .HasForeignKey(s => s.PharmacyID)
                .OnDelete(DeleteBehavior.Restrict);

            //  ProcessPrescription Relationships 
            modelBuilder.Entity<ProcessPrescription>()
                .HasOne(pp => pp.Pharmacist)
                .WithMany()
                .HasForeignKey(pp => pp.PharmacistID)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<ProcessPrescription>()
                .HasOne(pp => pp.Prescription)
                .WithMany()
                .HasForeignKey(pp => pp.PrescriptionID)
                .OnDelete(DeleteBehavior.Cascade); 
        }
    }
}
