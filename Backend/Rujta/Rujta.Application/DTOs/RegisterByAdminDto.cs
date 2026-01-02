using Rujta.Infrastructure.Identity;
using System.Text.Json.Serialization;

namespace Rujta.Application.DTOs
{
    public class RegisterByAdminDto : RegisterDto
    {
        public UserRole? Role { get; set; }

        [JsonIgnore]
        public int? PharmacyId { get; set; }
    }
}
