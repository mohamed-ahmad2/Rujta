namespace Rujta.Application.DTOs.CustomerDtos
{
    public class UpdateUserProfileDto
    {
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }

        public List<AddressDto>? Addresses { get; set; } = new ();
    }
}
