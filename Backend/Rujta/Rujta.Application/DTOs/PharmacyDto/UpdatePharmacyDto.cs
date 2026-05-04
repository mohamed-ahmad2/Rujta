using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class UpdatePharmacyDto
    {
        public string Name { get; set; } = string.Empty;
        public string ContactNumber { get; set; } = string.Empty;
        public string OpenHours { get; set; } = string.Empty;

        public AddressDto Address { get; set; } = new();
    }
}