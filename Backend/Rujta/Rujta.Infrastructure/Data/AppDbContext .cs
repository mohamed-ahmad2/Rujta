using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Extensions;
using Rujta.Infrastructure.Identity;


namespace Rujta.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
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

            
            builder.ApplyIdentityMapping();
            builder.ApplyDecimalPrecision();

            // Relationships
            builder.Entity<Pharmacy>()
                .HasOne(p => p.ParentPharmacy)
                .WithMany()
                .HasForeignKey(p => p.ParentPharmacyID)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Pharmacy>()
                .HasOne(p => p.Admin)
                .WithMany()
                .HasForeignKey(p => p.AdminId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Pharmacy>()
                .HasOne(p => p.Manager)
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
