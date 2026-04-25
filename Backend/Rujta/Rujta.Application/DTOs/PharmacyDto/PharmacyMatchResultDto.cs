using Rujta.Application.DTOs.MedicineDtos;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class PharmacyMatchResultDto
    {
        public int PharmacyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string ContactNumber { get; set; } = string.Empty;

        public int MatchedDrugs { get; set; }
        public int PartialMatches { get; set; }

        public int TotalShortage { get; set; }

        public int TotalRequestedDrugs { get; set; }
        public double MatchPercentage { get; set; }

        public double DistanceKm { get; set; }
        public double EstimatedDurationMinutes { get; set; }
        public double DeliveryFee { get; set; }

        public List<FoundMedicineDto> FoundMedicines { get; set; } = new();
        public List<NotFoundMedicineDto> NotFoundMedicines { get; set; } = new();
    }
}