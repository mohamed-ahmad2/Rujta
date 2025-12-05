namespace Rujta.Application.DTOs.UserProfile
{
    public class  UpdateUserProfileDto
    {
        public string? Name { get; set; }
        public string? PhoneNumber { get; set; }
        public string? ProfileImageUrl { get; set; }
        public AddressDto? Address { get; set; }
    }
}

