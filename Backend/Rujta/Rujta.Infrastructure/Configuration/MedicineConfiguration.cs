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
    public class MedicineConfiguration : IEntityTypeConfiguration<Medicine>
    {
        public void Configure(EntityTypeBuilder<Medicine> builder)
        {
           
            builder.HasKey(m => m.Id);

         
            builder.Property(m => m.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(m => m.Description)
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(m => m.Dosage)
                   .HasColumnType("NVARCHAR(MAX)");

            builder.Property(m => m.ActiveIngredient)
                   .HasMaxLength(150);

            builder.Property(m => m.Price)
                   .HasPrecision(10, 2)
                   .IsRequired();

            builder.Property(m => m.ExpiryDate)
                   .IsRequired();

            

            
            builder.HasMany(m => m.InventoryItems)
                   .WithOne(i => i.Medicine)
                   .HasForeignKey(i => i.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            
            builder.HasMany(m => m.SellDrugViaPharmacies)
                   .WithOne(s => s.Medicine)
                   .HasForeignKey(s => s.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            
            builder.HasMany(m => m.OrderItems)
                   .WithOne(o => o.Medicine)
                   .HasForeignKey(o => o.MedicineID)
                   .OnDelete(DeleteBehavior.Restrict);

            
            builder.ToTable("Medicines");
        }
    }
}
