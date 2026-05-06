using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class CustomerConfiguration : IEntityTypeConfiguration<Customer>
    {
        public void Configure(EntityTypeBuilder<Customer> builder)
        {

            builder.HasOne(c => c.Pharmacy)
                   .WithMany(p => p.Customers)
                   .HasForeignKey(c => c.PharmacyId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(c => c.Orders)
                   .WithOne(o => o.Customer)
                   .HasForeignKey(o => o.CustomerId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(c => c.PharmacyId)
                   .HasDatabaseName("IX_Customers_PharmacyId");
        }
    }
}