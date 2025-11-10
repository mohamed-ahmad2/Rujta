using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class SellDrugViaPharmacyConfiguration : IEntityTypeConfiguration<SellDrugViaPharmacy>
    {
        public void Configure(EntityTypeBuilder<SellDrugViaPharmacy> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Price)
                   .HasColumnType("decimal(18,2)");

            builder.Property(s => s.ConditionNote)
                   .HasMaxLength(255);

            builder.Property(s => s.ExpirationDate)
                   .IsRequired();

          
            builder.HasOne(s => s.Seller)
                   .WithMany(u => u.SellDrugViaPharmacies)
                   .HasForeignKey(s => s.SellerID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Pharmacy)
                   .WithMany(p => p.SellDrugViaPharmacies)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Medicine)
                   .WithMany(m => m.SellDrugViaPharmacies)
                   .HasForeignKey(s => s.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
