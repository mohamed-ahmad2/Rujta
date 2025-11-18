using Rujta.Domain.Common;

namespace Rujta.Domain.Entities
{
    public class RefreshToken : BaseEntity
    {
        public string Token { get; set; } = string.Empty;        
        public Guid UserId { get; set; }    
        public DateTime Expiration { get; set; }
        public DateTime? RevokedAt { get; set; }    
        public bool Revoked { get; set; } = false;  
        public string? DeviceInfo { get; set; }
        public string? LastAccessTokenJti { get; set; } = null;
        public DateTime? LastUsedAt { get; set; }
    }
}
