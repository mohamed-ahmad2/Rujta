using Microsoft.EntityFrameworkCore.Metadata.Builders;


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

           



            builder.HasOne(p => p.ParentPharmacy)
                   .WithMany(p => p.Branches)
                   .HasForeignKey(p => p.ParentPharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Pharmacists)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey(s => s.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.InventoryItems)
                   .WithOne(i => i.Pharmacy)
                   .HasForeignKey(i => i.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.Orders)
                   .WithOne(o => o.Pharmacy)
                   .HasForeignKey(o => o.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.SellDrugViaPharmacies)
                   .WithOne(s => s.Pharmacy)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
