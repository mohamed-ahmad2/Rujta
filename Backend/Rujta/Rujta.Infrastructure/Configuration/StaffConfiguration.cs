using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class StaffConfiguration : IEntityTypeConfiguration<Staff>
    {
        public void Configure(EntityTypeBuilder<Staff> builder)
        {
            builder.Property(s => s.Position)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(s => s.Salary)
                   .HasPrecision(10, 2);

            builder.HasOne(s => s.Manager)
                   .WithMany(m => m.Staff)
                   .HasForeignKey(s => s.ManagerID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(s => s.Pharmacy)
                   .WithMany(p => p.Staff)
                   .HasForeignKey(s => s.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
