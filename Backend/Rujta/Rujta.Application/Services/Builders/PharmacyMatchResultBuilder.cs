using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.DTOs.PharmacyDto;

namespace Rujta.Application.Services.Builders
{
    public class PharmacyMatchResultParams
    {
        public Pharmacy? Pharmacy { get; set; }
        public ItemDto? Order { get; set; }
        public int Matched { get; set; }
        public int PartialMatches { get; set; }
        public int TotalShortage { get; set; }
        public double DistanceKm { get; set; }
        public double DurationMinutes { get; set; }
        public double DeliveryFee { get; set; }
        public List<FoundMedicineDto>? Found { get; set; }
        public List<NotFoundMedicineDto>? NotFound { get; set; }
    }

    public static class PharmacyMatchResultBuilder
    {
        public static PharmacyMatchResultDto Build(PharmacyMatchResultParams param)
        {
            ArgumentNullException.ThrowIfNull(param);
            ArgumentNullException.ThrowIfNull(param.Pharmacy);

            var pharmacy = param.Pharmacy;
            var order = param.Order ?? new ItemDto();
            var foundList = param.Found ?? new List<FoundMedicineDto>();
            var notFoundList = param.NotFound ?? new List<NotFoundMedicineDto>();

            var latitude = pharmacy.Address?.Latitude ?? 0d;
            var longitude = pharmacy.Address?.Longitude ?? 0d;

            var totalRequested = order.Items?.Count ?? 0;

            return new PharmacyMatchResultDto
            {
                PharmacyId = pharmacy.Id,
                Name = pharmacy.Name ?? string.Empty,
                Latitude = latitude,
                Longitude = longitude,
                ContactNumber = pharmacy.ContactNumber ?? string.Empty,

                MatchedDrugs = param.Matched,
                PartialMatches = param.PartialMatches,
                TotalShortage = param.TotalShortage,
                TotalRequestedDrugs = totalRequested,
                MatchPercentage = totalRequested > 0
                    ? Math.Round((double)param.Matched / totalRequested * 100, 1)
                    : 0,

                DistanceKm = param.DistanceKm,
                EstimatedDurationMinutes = Math.Round(param.DurationMinutes, 1),
                DeliveryFee = Math.Round(param.DeliveryFee, 2),

                FoundMedicines = foundList,
                NotFoundMedicines = notFoundList
            };
        }
    }
}