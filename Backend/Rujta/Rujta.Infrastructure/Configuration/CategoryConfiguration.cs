using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Rujta.Infrastructure.Configuration
{
    public class CategoryConfiguration : IEntityTypeConfiguration<Category>
    {
        public void Configure(EntityTypeBuilder<Category> builder)
        {
            builder.HasKey(c => c.Id);

            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.HasMany(c => c.Medicines)
                   .WithOne(m => m.Category)
                   .HasForeignKey(m => m.CategoryId)
                   .OnDelete(DeleteBehavior.Restrict);

            builder.ToTable("Categories");
        }
    }
}
