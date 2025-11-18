using Rujta.Domain.Common;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser<Guid>
    {
        public Guid DomainPersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        [ForeignKey("DomainPersonId")]
        public  virtual Person? DomainPerson { get; set; }

        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }

    }
}
