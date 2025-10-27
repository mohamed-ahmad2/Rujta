using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class NearestPharmacyDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string DistanceKm { get; set; } = string.Empty;
        public string DurationMinutes { get; set; } = string.Empty;
    }
}
