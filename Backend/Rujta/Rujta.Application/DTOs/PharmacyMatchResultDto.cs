using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class PharmacyMatchResultDto
    {
        public int PharmacyId { get; set; }
        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string ContactNumber { get; set; }
        public int MatchedDrugs { get; set; }
        public int TotalRequestedDrugs { get; set; }
        public double DistanceKm { get; set; }
        public double MatchPercentage { get; set; }
        public double EstimatedDurationMinutes { get; set; }


    }


}
