using Rujta.Domain.Common;


namespace Rujta.Domain.Entities
{
    public class Address : BaseEntity
    {
        public Guid? UserId { get; set; }    
        public string Street { get; set; } = string.Empty;
        public string BuildingNo { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Governorate { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
        public User User { get; set; } = null!;
    }

}
