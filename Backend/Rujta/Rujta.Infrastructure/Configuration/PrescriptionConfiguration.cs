using Microsoft.EntityFrameworkCore.Metadata.Builders;


namespace Rujta.Infrastructure.Configuration
{
    public class PrescriptionConfiguration : IEntityTypeConfiguration<Prescription>
    {
        public void Configure(EntityTypeBuilder<Prescription> builder)
        {
            builder.HasKey(p => p.Id);

            builder.Property(p => p.DoctorName)
                   .HasMaxLength(100)
                   .IsRequired();

            builder.Property(p => p.Diagnosis)
                   .HasMaxLength(255);

            builder.Property(p => p.PrescriptionImageURL)
                   .HasMaxLength(500);

            builder.Property(p => p.OCR_Text)
                   .HasColumnType("text");

            builder.Property(p => p.Notes)
                   .HasMaxLength(500);

          
            builder.HasOne(p => p.Patient)
                   .WithMany(u => u.Prescriptions)
                   .HasForeignKey(p => p.PatientID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(p => p.ProcessPrescriptions)
                   .WithOne(pp => pp.Prescription)
                   .HasForeignKey(pp => pp.PrescriptionID)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(p => p.Orders)
                   .WithOne(o => o.Prescription)
                   .HasForeignKey(o => o.PrescriptionID)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(p => p.InventoryItems)
                   .WithOne(i => i.Prescription)
                   .HasForeignKey(i => i.PrescriptionID)
                   .OnDelete(DeleteBehavior.SetNull);
        }
    }
}
