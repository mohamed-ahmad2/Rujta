using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Rujta.Infrastructure.Configuration
{
    public class PharmacistConfiguration : IEntityTypeConfiguration<Pharmacist>
    {
        public void Configure(EntityTypeBuilder<Pharmacist> builder)
        {

            // Properties
            builder.Property(p => p.Qualification)
                   .IsRequired()
                   .HasMaxLength(100); 

            builder.Property(p => p.ExperienceYears)
                   .IsRequired();

            builder.Property(p => p.WorkStartTime)
                   .IsRequired();

            builder.Property(p => p.WorkEndTime)
                   .IsRequired();

            // Relationships
            builder.HasMany(p => p.ProcessPrescriptions)
                   .WithOne(pr => pr.Pharmacist)
                   .HasForeignKey(pr => pr.PharmacistID)
                   .OnDelete(DeleteBehavior.Restrict);

            
        }
    }
}
