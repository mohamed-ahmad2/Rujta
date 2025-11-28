using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Infrastructure.Identity;

namespace Rujta.Infrastructure.Configuration
{
    public class RefreshTokenConfiguration : IEntityTypeConfiguration<RefreshToken>
    {
        public void Configure(EntityTypeBuilder<RefreshToken> builder)
        {
            builder.ToTable("RefreshTokens");

            builder.HasKey(rt => rt.Id);

            builder.Property(rt => rt.Token)
                   .IsRequired()
                   .HasMaxLength(500);

            builder.Property(rt => rt.Expiration)
                   .IsRequired();

            builder.Property(rt => rt.Revoked)
                   .IsRequired();

            builder.Property(rt => rt.RevokedAt);

            builder.Property(rt => rt.DeviceInfo)
                   .HasMaxLength(250);

            builder.Property(rt => rt.LastAccessTokenJti)
                   .HasMaxLength(100);

            builder.Property(rt => rt.LastUsedAt);

            builder.HasOne<ApplicationUser>()
                   .WithMany(u => u.RefreshTokens)
                   .HasForeignKey(rt => rt.UserId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
