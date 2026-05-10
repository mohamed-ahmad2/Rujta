using Rujta.Application.DTOs.OrderDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    // CORRECT
    public class PublicPharmacySearchRequest
    {
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Governorate { get; set; } = string.Empty;
        public List<PublicCartItemDto> Items { get; set; } = new(); // ✅
    }
}
