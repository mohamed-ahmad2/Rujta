using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;
using Rujta.Domain.Entities.Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Data.Configurations
{
    public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
    {
        public void Configure(EntityTypeBuilder<Subscription> builder)
        {
            builder.HasKey(s => s.Id);

            builder.Property(s => s.Plan)
                .IsRequired()
                .HasConversion<string>();  // stores "Monthly"/"Yearly" in DB

            builder.Property(s => s.Status)
                .IsRequired()
                .HasConversion<string>();  // stores "Active"/"Expired"/"Pending"

            builder.Property(s => s.StartDate).IsRequired();
            builder.Property(s => s.EndDate).IsRequired();

            builder.HasOne(s => s.Pharmacy)
                .WithOne(p => p.Subscription)
                .HasForeignKey<Subscription>(s => s.PharmacyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}