using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Rujta.Infrastructure.Configuration
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            builder.ToTable("Addresses");
            builder.HasKey(a => a.Id);

            builder.Property(a => a.Street)
                   .IsRequired()
                   .HasMaxLength(200);

            builder.Property(a => a.BuildingNo)
                   .HasMaxLength(50);

            builder.Property(a => a.City)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.Governorate)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.Latitude)
                   .IsRequired()
                   .HasColumnType("decimal(9,6)");

            builder.Property(a => a.Longitude)
                   .IsRequired()
                   .HasColumnType("decimal(9,6)");

            builder.Property(a => a.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");

      
            builder.HasOne(a => a.Person)
                   .WithMany(p => p.Addresses)  
                   .HasForeignKey(a => a.PersonId)
                   .OnDelete(DeleteBehavior.Cascade)
                   .IsRequired(false);

     
            builder.HasIndex(a => new { a.Latitude, a.Longitude })
                   .HasDatabaseName("IX_Addresses_GeoLocation");

            builder.HasIndex(a => a.City)
                   .HasDatabaseName("IX_Addresses_City");

            builder.HasIndex(a => a.Governorate)
                   .HasDatabaseName("IX_Addresses_Governorate");

            builder.HasIndex(a => a.PersonId)
                   .HasDatabaseName("IX_Addresses_PersonId");

            builder.HasIndex(a => a.PharmacyId)
                   .HasDatabaseName("IX_Addresses_PharmacyId");
        }
    }
}