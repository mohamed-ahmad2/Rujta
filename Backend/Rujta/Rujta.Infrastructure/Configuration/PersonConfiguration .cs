using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Rujta.Domain.Common;

namespace Rujta.Infrastructure.Configuration
{
    public class PersonConfiguration : IEntityTypeConfiguration<Person>
    {
        public void Configure(EntityTypeBuilder<Person> builder)
        {
            builder.ToTable("People");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Id)
                   .ValueGeneratedOnAdd();

            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.Property(p => p.PhoneNumber)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(p => p.Email)
                   .IsRequired()
                   .HasMaxLength(150);

            builder.Property(p => p.ProfileImageUrl)
                   .HasMaxLength(500)
                   .IsRequired(false);

            builder.HasIndex(p => p.Email)
                   .IsUnique()
                   .HasDatabaseName("IX_People_Email");

            builder.HasMany(p => p.Addresses)
                   .WithOne(a => a.Person)
                   .HasForeignKey(a => a.PersonId)
                   .OnDelete(DeleteBehavior.Cascade);

            builder.Property(p => p.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(p => p.UpdatedAt)
                   .IsRequired(false);
        }
    }
}