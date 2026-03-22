using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class PharmacyStatsDto
    {
        public int PharmacyId { get; set; }
        public string Name { get; set; } = null!;
        public int TotalOrders { get; set; }
    }
}
