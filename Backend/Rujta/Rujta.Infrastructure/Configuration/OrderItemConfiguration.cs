using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class OrderItemConfiguration : IEntityTypeConfiguration<OrderItem>
    {
        public void Configure(EntityTypeBuilder<OrderItem> builder)
        {
            builder.HasKey(oi => oi.Id);

            builder.Property(oi => oi.PricePerUnit)
                   .HasColumnType("decimal(18,2)");

            builder.Property(oi => oi.SubTotal)
                   .HasColumnType("decimal(18,2)");

         
            builder.HasOne(oi => oi.Order)
                   .WithMany(o => o.OrderItems)
                   .HasForeignKey(oi => oi.OrderID)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(oi => oi.Medicine)
                   .WithMany(m => m.OrderItems)
                   .HasForeignKey(oi => oi.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
