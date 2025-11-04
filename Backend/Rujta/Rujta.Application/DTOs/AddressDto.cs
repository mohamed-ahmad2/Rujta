using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class AddressDto
    {
        public string FullName { get; set; } = string.Empty;
        public string MobileNumber { get; set; } = string.Empty;
        public string Street { get; set; } = string.Empty;
        public string BuildingNo { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Governorate { get; set; } = string.Empty;
        public string? Instructions { get; set; }
    }

}
