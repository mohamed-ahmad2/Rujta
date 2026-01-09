using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.Id);

            builder.Property(n => n.ReceiverType)
                   .IsRequired();

            builder.Property(n => n.UserId)
                   .HasMaxLength(200);

            builder.Property(n => n.PharmacyId);

            builder.Property(n => n.Title)
                   .IsRequired()
                   .HasMaxLength(250);

            builder.Property(n => n.Message)
                   .IsRequired()
                   .HasMaxLength(2048);

            builder.Property(n => n.Payload)
                   .HasMaxLength(4000);

            builder.Property(n => n.IsRead)
                   .HasDefaultValue(false);

            builder.Property(n => n.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(n => n.UpdatedAt);
        }
    }
}