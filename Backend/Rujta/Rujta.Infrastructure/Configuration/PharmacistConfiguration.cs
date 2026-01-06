using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class PharmacistConfiguration : IEntityTypeConfiguration<Pharmacist>
    {
        public void Configure(EntityTypeBuilder<Pharmacist> builder)
        {
            builder.Property(p => p.Position)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(p => p.Salary)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(p => p.HireDate)
                   .IsRequired();

            builder.HasOne(p => p.Manager)
                   .WithMany(m => m.Pharmacists)
                   .HasForeignKey(p => p.ManagerId)
                   .OnDelete(DeleteBehavior.Restrict);

            // لا نربط Pharmacist مباشرة بالPharmacy، لأنه مرتبط عبر Employee
        }
    }
}
