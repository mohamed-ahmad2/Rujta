using Microsoft.EntityFrameworkCore.Metadata.Builders;


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


            builder.HasOne(p => p.Pharmacy)
                   .WithMany(ph => ph.Pharmacists)
                   .HasForeignKey(p => p.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
