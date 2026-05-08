using OsmSharp.API;
using Rujta.Application.DTOs.AuthDto;
using Rujta.Infrastructure.Identity;

namespace Rujta.Application.DTOs
{
    public class CreatePharmacistDto : RegisterDto
    {
        public string Position { get; set; } = UserRole.Pharmacist.ToString();
        public decimal Salary { get; set; } = default;
        public DateTime HireDate { get; set; } = DateTime.UtcNow;
        public Guid? ManagerId { get; set; }
    }
}
