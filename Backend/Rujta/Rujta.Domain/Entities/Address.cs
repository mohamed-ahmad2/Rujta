using Rujta.Domain.Common;


namespace Rujta.Domain.Entities
{
    public class Address : BaseEntity
    {
        
        public Guid UserId { get; set; }    
        public string FullName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNo { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Governorate { get; set; } = string.Empty;
        public string? Instructions { get; set; }
        public bool IsDefault { get; set; }

        
        public User User { get; set; } = null!;
    }

}
