using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class AddressConfiguration : IEntityTypeConfiguration<Address>
    {
        public void Configure(EntityTypeBuilder<Address> builder)
        {
            
            builder.Property(a => a.FullName)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(a => a.MobileNumber)
                   .IsRequired()
                   .HasMaxLength(20);

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

            builder.Property(a => a.Instructions)
                   .HasMaxLength(300);

            builder.Property(a => a.IsDefault)
                   .HasDefaultValue(true);

          
            builder.HasOne(a => a.User)
                   .WithOne(u => u.Address)  
                   .HasForeignKey<Address>(a => a.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
