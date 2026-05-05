using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
            builder.HasKey(m => m.Id);

            builder.Property(m => m.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(m => m.Description)
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(m => m.Dosage)
                   .HasMaxLength(100);

            builder.Property(m => m.ActiveIngredient)
                   .HasMaxLength(150);

            builder.Property(m => m.Price)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(m => m.ExpiryDate)
                   .IsRequired();

            builder.Property(m => m.ImageUrl)
                   .HasMaxLength(500)
                   .IsRequired(false);

            builder.HasOne(m => m.Company)
                   .WithMany(c => c.Medicines)
                   .HasForeignKey(m => m.CompanyId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(m => m.Category)
                   .WithMany(c => c.Medicines)
                   .HasForeignKey(m => m.CategoryId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(m => m.InventoryItems)
                   .WithOne(i => i.Medicine)
                   .HasForeignKey(i => i.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(m => m.SellDrugViaPharmacies)
                   .WithOne(s => s.Medicine)
                   .HasForeignKey(s => s.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(m => m.OrderItems)
                   .WithOne(o => o.Medicine)
                   .HasForeignKey(o => o.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(m => m.Name)
                   .HasDatabaseName("IX_Medicines_Name");

            builder.HasIndex(m => m.ActiveIngredient)
                   .HasDatabaseName("IX_Medicines_ActiveIngredient");

            builder.HasIndex(m => m.CompanyId)
                   .HasDatabaseName("IX_Medicines_CompanyId");

            builder.HasIndex(m => m.CategoryId)
                   .HasDatabaseName("IX_Medicines_CategoryId");

            builder.HasIndex(m => m.ExpiryDate)
                   .HasDatabaseName("IX_Medicines_ExpiryDate");

            builder.ToTable("Medicines", t =>
            {
                t.HasCheckConstraint(
                    "CK_Medicines_PositivePrice",
                    "[Price] >= 0");
            });
        }
    }
}