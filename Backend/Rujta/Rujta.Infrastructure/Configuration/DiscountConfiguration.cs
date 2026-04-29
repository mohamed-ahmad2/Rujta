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

            builder.HasOne<Medicine>()
                   .WithMany()
                   .HasForeignKey(d => d.MedicineId)
                   .OnDelete(DeleteBehavior.Cascade)       
                   .IsRequired(false);

            builder.HasOne<Category>()
                   .WithMany()
                   .HasForeignKey(d => d.CategoryId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false);

            builder.HasOne<Company>()
                   .WithMany()
                   .HasForeignKey(d => d.CompanyId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false);

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