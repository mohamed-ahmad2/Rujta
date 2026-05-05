using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Rujta.Domain.Common;
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

        // People
        public DbSet<Person> People { get; set; } = null!;

        //Entities
        public DbSet<Address> Addresses { get; set; } = null!;
        public DbSet<Pharmacy> Pharmacies { get; set; } = null!;
        public DbSet<Medicine> Medicines { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;
        public DbSet<Company> Companies { get; set; } = null!;
        public DbSet<Discount> Discounts { get; set; } = null!;
        public DbSet<InventoryItem> InventoryItems { get; set; } = null!;

        // Orders & Sales
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        public DbSet<SellDrugViaPharmacy> SellDrugViaPharmacies { get; set; } = null!;

        //Prescriptions
        public DbSet<Prescription> Prescriptions { get; set; } = null!;
        public DbSet<ProcessPrescription> ProcessPrescriptions { get; set; } = null!;

        // Auth & Security
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Device> Devices { get; set; } = null!;

        //Notifications & Logs
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<Log> Logs { get; set; } = null!;

        // Subscriptions & Payments
        public DbSet<Subscription> Subscriptions { get; set; } = null!;
        public DbSet<DrugRequest> DrugRequests { get; set; } = null!;
        
        public DbSet<Payment> Payments { get; set; } = null!;
        public DbSet<Ad> Ads { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.ApplyIdentityMapping();
            builder.ApplyDecimalPrecision();

            builder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            foreach (var relationship in builder.Model
                .GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys())
                .Where(fk => !fk.IsOwnership && fk.DeleteBehavior == DeleteBehavior.Cascade))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }
        }


        public override int SaveChanges()
        {
            ApplyAuditInformation();
            return base.SaveChanges();
        }

        public override int SaveChanges(bool acceptAllChangesOnSuccess)
        {
            ApplyAuditInformation();
            return base.SaveChanges(acceptAllChangesOnSuccess);
        }

        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            ApplyAuditInformation();
            return await base.SaveChangesAsync(cancellationToken);
        }

        public override async Task<int> SaveChangesAsync(
            bool acceptAllChangesOnSuccess,
            CancellationToken cancellationToken = default)
        {
            ApplyAuditInformation();
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);
        }

        private void ApplyAuditInformation()
        {
            var now = DateTime.UtcNow;

            foreach (var entry in ChangeTracker.Entries<BaseEntity>())
            {
                switch (entry.State)
                {
                    case EntityState.Added:
                        entry.Entity.CreatedAt = now;
                        entry.Entity.UpdatedAt = now;
                        break;

                    case EntityState.Modified:
                        entry.Entity.UpdatedAt = now;
                        entry.Property(nameof(BaseEntity.CreatedAt)).IsModified = false;
                        break;
                }
            }
        }
    }
}