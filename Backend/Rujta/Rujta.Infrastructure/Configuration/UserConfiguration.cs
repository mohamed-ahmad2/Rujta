using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            

            builder.Property(u => u.MedicalHistory)
                   .HasMaxLength(500);

            builder.Property(u => u.Allergies)
                   .HasMaxLength(300);

            builder.Property(u => u.ChronicDiseases)
                   .HasMaxLength(300);

            builder.Property(u => u.Weight)
                   .HasPrecision(5, 2);

            builder.Property(u => u.Height)
                   .HasPrecision(5, 2);
        }
    }
}
