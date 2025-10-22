﻿using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Configuration
{
    public class ManagerConfiguration : IEntityTypeConfiguration<Manager>
    {
        public void Configure(EntityTypeBuilder<Manager> builder)
        {
            

            builder.Property(m => m.StartDate)
                   .IsRequired();

            builder.Property(m => m.EndDate)
                   .IsRequired(false);


            builder.HasOne(m => m.Admin)
                   .WithMany(a => a.Managers)
                   .HasForeignKey(m => m.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(m => m.Staff)
                   .WithOne(s => s.Manager)
                   .HasForeignKey(s => s.ManagerID)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
