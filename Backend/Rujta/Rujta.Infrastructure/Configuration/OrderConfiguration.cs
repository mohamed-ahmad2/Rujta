using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;


namespace Rujta.Infrastructure.Configuration
{
    public class OrderConfiguration : IEntityTypeConfiguration<Order>
    {
        public void Configure(EntityTypeBuilder<Order> builder)
        {
            builder.HasKey(o => o.Id);

            builder.Property(o => o.TotalPrice)
                   .HasColumnType("decimal(18,2)");

            builder.Property(o => o.DeliveryAddress)
                   .HasMaxLength(255)
                   .IsRequired();

            
            builder.HasOne(o => o.User)
                   .WithMany(u => u.Orders)
                   .HasForeignKey(o => o.UserID)
                   .OnDelete(DeleteBehavior.Restrict);


            builder.HasOne(o => o.Pharmacy)
                   .WithMany(p => p.Orders)
                   .HasForeignKey(o => o.PharmacyID)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(o => o.Prescription)
                   .WithMany(p => p.Orders)
                   .HasForeignKey(o => o.PrescriptionID)
                   .OnDelete(DeleteBehavior.SetNull);

            builder.HasMany(o => o.OrderItems)
                   .WithOne(oi => oi.Order)
                   .HasForeignKey(oi => oi.OrderID)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
