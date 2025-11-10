using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    internal class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                   .IsRequired()
                   .HasMaxLength(256);

            builder.Property(rt => rt.UserId)
                   .IsRequired();

            builder.Property(rt => rt.Expiration)
                   .IsRequired();

            
            builder.HasIndex(rt => rt.Token)
                   .IsUnique();
        }
    }
}
