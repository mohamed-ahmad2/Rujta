using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities.Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class PharmacyConfiguration : IEntityTypeConfiguration<Pharmacy>
    {
        public void Configure(EntityTypeBuilder<Pharmacy> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(p => p.Location)
                   .HasMaxLength(250);

            builder.Property(p => p.ContactNumber)
                   .HasMaxLength(20);

            builder.Property(p => p.OpenHours)
                   .HasMaxLength(100);


            builder.Property(p => p.IsActive)
                   .HasDefaultValue(true);

            builder.Property(p => p.IsDeleted)
                   .HasDefaultValue(false);

            builder.HasOne(p => p.Admin)
                   .WithMany(a => a.Pharmacies)
                   .HasForeignKey(p => p.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.ParentPharmacy)
                   .WithMany(p => p.Branches)
                   .HasForeignKey(p => p.ParentPharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Employees)
                   .WithOne(e => e.Pharmacy)
                   .HasForeignKey(e => e.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.InventoryItems)
                   .WithOne(i => i.Pharmacy)
                   .HasForeignKey(i => i.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Orders)
                   .WithOne(o => o.Pharmacy)
                   .HasForeignKey(o => o.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.SellDrugViaPharmacy)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

 
            builder.HasMany(p => p.Customers)
                   .WithOne(c => c.Pharmacy)
                   .HasForeignKey(c => c.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);


            builder.HasOne(p => p.Subscription)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey<Subscription>(s => s.PharmacyId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(p => p.IsActive)
                   .HasDatabaseName("IX_Pharmacies_IsActive");

            builder.HasIndex(p => p.IsDeleted)
                   .HasDatabaseName("IX_Pharmacies_IsDeleted");

            builder.ToTable("Pharmacies"); 
        }
    }
}