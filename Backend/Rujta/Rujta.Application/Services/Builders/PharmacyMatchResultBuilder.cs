using Rujta.Application.DTOs;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services.Builders
{
    public static class PharmacyMatchResultBuilder
    {
        public static PharmacyMatchResultDto Build(
            Pharmacy pharmacy,
            ItemDto order,
            int matched,
            double distanceKm,
            double durationMinutes,
            List<FoundMedicineDto> found,
            List<NotFoundMedicineDto> notFound)
        {
            return new PharmacyMatchResultDto
            {
                PharmacyId = pharmacy.Id,
                Name = pharmacy.Name,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                ContactNumber = pharmacy.ContactNumber ?? string.Empty,

                MatchedDrugs = matched,
                TotalRequestedDrugs = order.Items.Count,
                MatchPercentage = order.Items.Count > 0
                    ? Math.Round(((double)matched / order.Items.Count) * 100, 1)
                    : 0,

                DistanceKm = distanceKm,
                EstimatedDurationMinutes = Math.Round(durationMinutes, 1),

                FoundMedicines = found,
                NotFoundMedicines = notFound
            };
        }
    }
}
