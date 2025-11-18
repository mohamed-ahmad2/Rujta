using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Rujta.Infrastructure.Configuration
{
    public class ProcessPrescriptionConfiguration : IEntityTypeConfiguration<ProcessPrescription>
    {
        public void Configure(EntityTypeBuilder<ProcessPrescription> builder)
        {
            builder.HasKey(pp => pp.Id);

            builder.Property(pp => pp.Comments)
                   .HasMaxLength(500);

            builder.Property(pp => pp.DateProcessed)
                   .IsRequired();

           
            builder.HasOne(pp => pp.Pharmacist)
                   .WithMany(ph => ph.ProcessPrescriptions)
                   .HasForeignKey(pp => pp.PharmacistID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(pp => pp.Prescription)
                   .WithMany(p => p.ProcessPrescriptions)
                   .HasForeignKey(pp => pp.PrescriptionID)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
