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
            if (param == null)
                throw new ArgumentNullException(nameof(param));

            var pharmacy = param.Pharmacy ?? throw new ArgumentNullException(nameof(param));
            var order = param.Order ?? new ItemDto();

            var foundList = param.Found ?? new List<FoundMedicineDto>();
            var notFoundList = param.NotFound ?? new List<NotFoundMedicineDto>();

            return new PharmacyMatchResultDto
            {
                PharmacyId = pharmacy.Id,
                Name = pharmacy.Name ?? string.Empty,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                ContactNumber = pharmacy.ContactNumber ?? string.Empty,

                MatchedDrugs = param.Matched,
                TotalRequestedDrugs = order.Items.Count,
                MatchPercentage = order.Items.Count > 0
                    ? Math.Round(((double)param.Matched / order.Items.Count) * 100, 1)
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