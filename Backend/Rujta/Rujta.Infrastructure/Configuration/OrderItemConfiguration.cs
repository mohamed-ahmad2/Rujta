using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
