using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Rujta.Infrastructure.Configuration
{
    public class EmployeeConfiguration : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.Property(p => p.Qualification)
                   .IsRequired()
                   .HasMaxLength(100); 

            builder.Property(p => p.ExperienceYears)
                   .IsRequired();

            builder.Property(p => p.WorkStartTime)
                   .IsRequired();

            builder.Property(p => p.WorkEndTime)
                   .IsRequired();

            builder.HasMany(p => p.ProcessPrescriptions)
                   .WithOne(pr => pr.Pharmacist)
                   .HasForeignKey(pr => pr.PharmacistID)
                   .OnDelete(DeleteBehavior.Restrict);

            
        }
    }
}
