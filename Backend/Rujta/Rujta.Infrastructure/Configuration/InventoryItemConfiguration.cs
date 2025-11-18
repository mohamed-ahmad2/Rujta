using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
    {
        public void Configure(EntityTypeBuilder<InventoryItem> builder)
        {
            
            builder.ToTable("InventoryItems");

            
            builder.HasKey(i => i.Id);

            
            builder.Property(i => i.Quantity)
                   .IsRequired();

            builder.Property(i => i.Price)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(i => i.ExpiryDate)
                   .IsRequired();

            builder.Property(i => i.IsDispensed)
                   .IsRequired();

            

            
            builder.HasOne(i => i.Pharmacy)
                   .WithMany(p => p.InventoryItems)
                   .HasForeignKey(i => i.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            
            builder.HasOne(i => i.Medicine)
                   .WithMany(m => m.InventoryItems)
                   .HasForeignKey(i => i.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            
            builder.HasOne(i => i.Prescription)
                   .WithMany(p => p.InventoryItems)
                   .HasForeignKey(i => i.PrescriptionID)
                   .OnDelete(DeleteBehavior.SetNull);

            
            builder.HasIndex(i => new { i.PharmacyID, i.MedicineID })
                   .HasDatabaseName("IX_InventoryItem_Pharmacy_Medicine");

            builder.HasIndex(i => i.ExpiryDate)
                   .HasDatabaseName("IX_InventoryItem_ExpiryDate");
        }
    }
}
