using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Infrastructure.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Configuration
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            
            builder.ToTable("RefreshTokens");

            // Primary key
            builder.HasKey(rt => rt.Id);

            // Token is required
            builder.Property(rt => rt.Token)
                   .IsRequired()
                   .HasMaxLength(500);

            // Expiration is required
            builder.Property(rt => rt.Expiration)
                   .IsRequired();

            // Relationships
            builder.HasOne<ApplicationUser>()
                   .WithMany("RefreshTokens")
                   .HasForeignKey(rt => rt.UserId)
                   .OnDelete(DeleteBehavior.Cascade);


            // Optional properties
            builder.Property(rt => rt.DeviceInfo)
                   .HasMaxLength(250);

            builder.Property(rt => rt.LastAccessTokenJti)
                   .HasMaxLength(100);
        }
    }
}
