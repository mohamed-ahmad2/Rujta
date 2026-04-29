using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.HasIndex(c => c.Name)
                   .IsUnique()                   
                   .HasDatabaseName("IX_Companies_Name");

            builder.HasMany(c => c.Medicines)
                   .WithOne(m => m.Company)
                   .HasForeignKey(m => m.CompanyId)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.ToTable("Companies");
        }
    }
}