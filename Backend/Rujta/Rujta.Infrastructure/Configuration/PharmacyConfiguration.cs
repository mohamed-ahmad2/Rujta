using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class PharmacyConfiguration : IEntityTypeConfiguration<Pharmacy>
    {
        public void Configure(EntityTypeBuilder<Pharmacy> builder)
        {
            builder.ToTable("Pharmacies");
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(p => p.Location)
                   .IsRequired()
                   .HasMaxLength(250);

            builder.Property(p => p.ContactNumber)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(p => p.OpenHours)
                   .HasMaxLength(100);

            builder.Property(p => p.ImageUrl)
                   .HasMaxLength(500)
                   .IsRequired(false);

            builder.Property(p => p.Latitude)
                   .HasColumnType("decimal(9,6)");

            builder.Property(p => p.Longitude)
                   .HasColumnType("decimal(9,6)");

            builder.Property(p => p.IsActive)
                   .HasDefaultValue(true);

            builder.Property(p => p.IsDeleted)
                   .HasDefaultValue(false);

            builder.Property(p => p.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");

            // Admin
            builder.HasOne(p => p.Admin)
                   .WithMany(a => a.Pharmacies)
                   .HasForeignKey(p => p.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Manager (One-to-One)
            builder.HasOne(p => p.Manager)
                   .WithOne(m => m.ManagedPharmacy)
                   .HasForeignKey<Pharmacy>(p => p.ManagerId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Self-Reference
            builder.HasOne(p => p.ParentPharmacy)
                   .WithMany(p => p.Branches)
                   .HasForeignKey(p => p.ParentPharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            // Employees
            builder.HasMany(p => p.Employees)
                   .WithOne(e => e.Pharmacy)
                   .HasForeignKey(e => e.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            // InventoryItems
            builder.HasMany(p => p.InventoryItems)
                   .WithOne(i => i.Pharmacy)
                   .HasForeignKey(i => i.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            // Orders
            builder.HasMany(p => p.Orders)
                   .WithOne(o => o.Pharmacy)
                   .HasForeignKey(o => o.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            // SellDrugViaPharmacy
            builder.HasMany(p => p.SellDrugViaPharmacy)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            // ✅ Customers (One-to-Many) - بدل الـ Many-to-Many الغلط
            builder.HasMany(p => p.Customers)
                   .WithOne(c => c.Pharmacy)
                   .HasForeignKey(c => c.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Subscription (One-to-One)
            builder.HasOne(p => p.Subscription)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey<Subscription>(s => s.PharmacyId)
                   .OnDelete(DeleteBehavior.Cascade);

            // Discounts
            builder.HasMany(p => p.Discounts)
                   .WithOne(d => d.Pharmacy)
                   .HasForeignKey(d => d.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            // Indexes
            builder.HasIndex(p => p.IsActive)
                   .HasDatabaseName("IX_Pharmacies_IsActive");

            builder.HasIndex(p => p.Name)
                   .HasDatabaseName("IX_Pharmacies_Name");

            builder.HasIndex(p => new { p.Latitude, p.Longitude })
                   .HasDatabaseName("IX_Pharmacies_GeoLocation");

            builder.HasIndex(p => p.ManagerId)
                   .IsUnique()
                   .HasFilter("[ManagerId] IS NOT NULL")
                   .HasDatabaseName("IX_Pharmacies_ManagerId_Unique");
        }
    }
}