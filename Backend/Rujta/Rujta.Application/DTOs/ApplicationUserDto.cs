using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class ApplicationUserDto
    {
        public Guid Id { get; set; }
        public Guid DomainPersonId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Location { get; set; } = string.Empty;
        public string? DeviceId { get; set; }
        public string Role { get; set; } = string.Empty;
    }
}
