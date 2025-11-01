using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Extensions;
using Rujta.Infrastructure.Identity;
using System.Reflection.Emit;


namespace Rujta.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }


        // Person table
        public DbSet<Person> People { get; set; }

        

        // Entities
        public DbSet<Pharmacy> Pharmacies { get; set; }
        public DbSet<Medicine> Medicines { get; set; }
        public DbSet<InventoryItem> InventoryItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Prescription> Prescriptions { get; set; }
        public DbSet<ProcessPrescription> ProcessPrescriptions { get; set; }
        public DbSet<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; }
        public DbSet<Notification> Notifications { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Notification>(b =>
            {
                b.HasKey(n => n.Id);
                b.Property(n => n.UserId).IsRequired().HasMaxLength(200);
                b.Property(n => n.Title).IsRequired().HasMaxLength(250);
                b.Property(n => n.Message).IsRequired().HasMaxLength(2048);
                b.Property(n => n.Payload).HasMaxLength(4000);
                b.Property(n => n.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            builder.ApplyIdentityMapping();
            builder.ApplyDecimalPrecision();

            builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
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
