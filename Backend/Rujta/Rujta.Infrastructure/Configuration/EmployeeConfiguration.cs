using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.Property(e => e.Qualification)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(e => e.ExperienceYears)
                   .IsRequired();

            builder.Property(e => e.WorkStartTime)
                   .IsRequired();

            builder.Property(e => e.WorkEndTime)
                   .IsRequired();

  
            builder.HasOne(e => e.Pharmacy)
                   .WithMany(p => p.Employees)
                   .HasForeignKey(e => e.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}