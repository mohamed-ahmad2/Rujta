using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class DeviceConfiguration : IEntityTypeConfiguration<Device>
    {
        public void Configure(EntityTypeBuilder<Device> builder)
        {
            
            builder.HasKey(d => d.Id);

            
            builder.Property(d => d.DeviceId)
                   .IsRequired()
                   .HasMaxLength(100); 

            
            builder.Property(d => d.DeviceName)
                   .HasMaxLength(200);

            
            builder.Property(d => d.IPAddress)
                   .HasMaxLength(50);

            
            builder.Property(d => d.LastUsedAt);

            
            builder.HasOne<User>()            
                   .WithMany()               
                   .HasForeignKey(d => d.UserId)
                   .OnDelete(DeleteBehavior.Cascade);

            
            builder.HasIndex(d => d.DeviceId)
                   .IsUnique();
        }
    }
}
