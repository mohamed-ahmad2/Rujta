using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;


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

            builder.HasOne(p => p.Admin)
                   .WithMany(a => a.Pharmacies)
                   .HasForeignKey(p => p.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.Manager)
                   .WithMany()
                   .HasForeignKey(p => p.ManagerId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(p => p.ParentPharmacy)
                   .WithMany()
                   .HasForeignKey(p => p.ParentPharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Staff)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.InventoryItems)
                    .WithOne(i => i.Pharmacy)
                    .HasForeignKey(s => s.PharmacyID)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Orders)
                    .WithOne(i => i.Pharmacy)
                    .HasForeignKey(s => s.PharmacyID)
                    .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.SellDrugViaPharmacies)
                    .WithOne(i => i.Pharmacy)
                    .HasForeignKey(s => s.PharmacyID)
                    .OnDelete(DeleteBehavior.Restrict);

            
        }
    }
}
