using Microsoft.AspNetCore.Identity;

namespace Rujta.Infrastructure.Identity.Entities
{
    public abstract class Person : IdentityUser<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
