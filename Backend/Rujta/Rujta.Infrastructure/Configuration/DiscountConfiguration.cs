using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class DiscountConfiguration : IEntityTypeConfiguration<Discount>
    {
        public void Configure(EntityTypeBuilder<Discount> builder)
        {
            builder.HasKey(d => d.Id);

            builder.Property(d => d.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(d => d.Value)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(d => d.Type)
                   .IsRequired()
                   .HasConversion<int>();

            builder.Property(d => d.Scope)
                   .IsRequired()
                   .HasConversion<int>();

            builder.Property(d => d.StartDate)
                   .IsRequired();

            builder.Property(d => d.EndDate)
                   .IsRequired();

            builder.Property(d => d.IsActive)
                   .HasDefaultValue(true);

            builder.HasOne(d => d.Medicine)
                   .WithMany(m => m.Discounts)
                   .HasForeignKey(d => d.MedicineId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            builder.HasOne(d => d.Category)
                   .WithMany(c => c.Discounts)
                   .HasForeignKey(d => d.CategoryId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            builder.HasOne(d => d.Company)
                   .WithMany(c => c.Discounts)
                   .HasForeignKey(d => d.CompanyId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);

            builder.HasOne(d => d.Pharmacy)
                   .WithMany(p => p.Discounts)
                   .HasForeignKey(d => d.PharmacyId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired();

            // Indexes
            builder.HasIndex(d => d.IsActive)
                   .HasDatabaseName("IX_Discounts_IsActive");

            builder.HasIndex(d => d.Scope)
                   .HasDatabaseName("IX_Discounts_Scope");

            builder.HasIndex(d => new { d.StartDate, d.EndDate })
                   .HasDatabaseName("IX_Discounts_DateRange");

            builder.HasIndex(d => d.MedicineId)
                   .HasDatabaseName("IX_Discounts_MedicineId");

            builder.HasIndex(d => d.CategoryId)
                   .HasDatabaseName("IX_Discounts_CategoryId");

            builder.HasIndex(d => d.CompanyId)
                   .HasDatabaseName("IX_Discounts_CompanyId");

            builder.ToTable("Discounts", t =>
            {
                t.HasCheckConstraint(
                    "CK_Discounts_DateRange",
                    "[EndDate] >= [StartDate]");

                t.HasCheckConstraint(
                    "CK_Discounts_PositiveValue",
                    "[Value] >= 0");
            });
        }
    }
}