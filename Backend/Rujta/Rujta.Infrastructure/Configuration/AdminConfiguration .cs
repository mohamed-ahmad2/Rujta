using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class AdminConfiguration : IEntityTypeConfiguration<Admin>
    {
        public void Configure(EntityTypeBuilder<Admin> builder)
        {
            

            builder.HasMany(a => a.Pharmacies)
                   .WithOne(p => p.Admin)
                   .HasForeignKey(p => p.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(a => a.Managers)
                   .WithOne(m => m.Admin)
                   .HasForeignKey(m => m.AdminId)
                   .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
