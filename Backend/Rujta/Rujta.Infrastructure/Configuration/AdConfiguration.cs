using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class AdConfiguration : IEntityTypeConfiguration<Ad>
    {
        public void Configure(EntityTypeBuilder<Ad> builder)
        {
            builder.HasKey(a => a.Id);

            builder.Property(a => a.TemplateName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.Badge)
                   .IsRequired()
                   .HasMaxLength(50);

            builder.Property(a => a.AdMode)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("medicine");

            builder.Property(a => a.Headline)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(a => a.Subtext)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(a => a.CtaLabel)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.ColorFrom)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("#0ea5e9");

            builder.Property(a => a.ColorTo)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("#0369a1");

            builder.Property(a => a.ColorAccent)
                   .IsRequired()
                   .HasMaxLength(20)
                   .HasDefaultValue("#38bdf8");

            builder.Property(a => a.FontLabel)
                   .IsRequired()
                   .HasMaxLength(50)
                   .HasDefaultValue("Modern Sans");

            builder.Property(a => a.MedicineName)
                   .HasMaxLength(150);

            builder.Property(a => a.MedicineImage)
                    .HasColumnType("NVARCHAR(MAX)");         

            builder.Property(a => a.Category)
                   .HasMaxLength(100);

            builder.Property(a => a.Price)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(a => a.DurationDays)
                   .IsRequired();

            builder.Property(a => a.CreatedAt)
                   .IsRequired()
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(a => a.UpdatedAt)
                   .IsRequired(false);

            builder.Property(a => a.StartsAt)
                   .IsRequired(false);

            builder.Property(a => a.ExpiresAt)
                   .IsRequired(false);

            builder.Property(a => a.IsActive)
                   .IsRequired()
                   .HasDefaultValue(true);

            builder.Ignore(a => a.IsExpired);

            builder.HasOne(a => a.Pharmacy)
                   .WithMany()
                   .HasForeignKey(a => a.PharmacyId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne<Medicine>()
                   .WithMany()
                   .HasForeignKey(a => a.MedicineId)
                   .OnDelete(DeleteBehavior.SetNull)
                   .IsRequired(false);


            builder.HasIndex(a => a.PharmacyId)
                   .HasDatabaseName("IX_Ads_PharmacyId");

            builder.HasIndex(a => a.MedicineId)
                   .HasDatabaseName("IX_Ads_MedicineId");

            builder.HasIndex(a => a.IsActive)
                   .HasDatabaseName("IX_Ads_IsActive");

            builder.HasIndex(a => a.ExpiresAt)
                   .HasDatabaseName("IX_Ads_ExpiresAt");

            builder.HasIndex(a => new { a.IsActive, a.ExpiresAt })
                   .HasDatabaseName("IX_Ads_Active_NotExpired");

            builder.HasIndex(a => a.AdMode)
                   .HasDatabaseName("IX_Ads_AdMode");

            builder.ToTable("Ads", t =>
            {
                t.HasCheckConstraint(
                    "CK_Ads_PositivePrice",
                    "[Price] >= 0");

                t.HasCheckConstraint(
                    "CK_Ads_PositiveDuration",
                    "[DurationDays] > 0");

                t.HasCheckConstraint(
                    "CK_Ads_DateRange",
                    "[ExpiresAt] IS NULL OR [StartsAt] IS NULL OR [ExpiresAt] >= [StartsAt]");
            });
        }
    }
}