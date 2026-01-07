using Microsoft.EntityFrameworkCore;
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

           
            builder.Property(p => p.Name)
                   .IsRequired()
                   .HasMaxLength(100);

            builder.HasMany(p => p.Addresses)
                   .WithOne(a => a.Person)
                   .HasForeignKey(a => a.PersonId)
                   .OnDelete(DeleteBehavior.Cascade);


            builder.Property(p => p.PhoneNumber)
                   .IsRequired()
                   .HasMaxLength(20);

            builder.Property(p => p.CreatedAt)
                   .HasDefaultValueSql("GETUTCDATE()");

            builder.Property(p => p.UpdatedAt)
                   .IsRequired(false);
        }
    }
}
