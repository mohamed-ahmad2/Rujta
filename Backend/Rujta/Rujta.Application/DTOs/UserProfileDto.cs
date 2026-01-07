namespace Rujta.Application.DTOs
{
    public class UserProfileDto
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public List<AddressDto> Addresses { get; set; } = new();
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public string? ProfileImageUrl { get; set; }
    }
}

