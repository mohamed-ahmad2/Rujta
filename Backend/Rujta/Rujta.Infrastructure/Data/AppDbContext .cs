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
        public DbSet<Person> People { get; set; } = null!;

        // Entities
        public DbSet<Address> Addresses { get; set; } = null!;
        public DbSet<Pharmacy> Pharmacies { get; set; } = null!;
        public DbSet<Medicine> Medicines { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<InventoryItem> InventoryItems { get; set; } = null!;
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<Prescription> Prescriptions { get; set; } = null!;
        public DbSet<ProcessPrescription> ProcessPrescriptions { get; set; } = null!;
        public DbSet<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Device> Devices { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Log> Logs { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Notification configuration
            builder.Entity<Notification>(b =>
            {
                b.HasKey(n => n.Id);
                b.Property(n => n.UserId).IsRequired().HasMaxLength(200);
                b.Property(n => n.Title).IsRequired().HasMaxLength(250);
                b.Property(n => n.Message).IsRequired().HasMaxLength(2048);
                b.Property(n => n.Payload).HasMaxLength(4000);
                b.Property(n => n.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
            });

            // Identity & Decimal precision
            builder.ApplyIdentityMapping();
            builder.ApplyDecimalPrecision();

            // Apply all configurations from assembly
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
