namespace Rujta.Application.Services.Builders
{
    public class PharmacyMatchResultParams
    {
        public Pharmacy Pharmacy { get; set; }
        public ItemDto Order { get; set; }
        public int Matched { get; set; }
        public double DistanceKm { get; set; }
        public double DurationMinutes { get; set; }
        public double DeliveryFee { get; set; }
        public List<FoundMedicineDto> Found { get; set; }
        public List<NotFoundMedicineDto> NotFound { get; set; }
        public List<(double lat, double lng)> RouteShape { get; set; } = new();
    }

    public static class PharmacyMatchResultBuilder
    {
        public static PharmacyMatchResultDto Build(PharmacyMatchResultParams param)
        {
            if (param == null)
                throw new ArgumentNullException(nameof(param));

            return new PharmacyMatchResultDto
            {
                PharmacyId = param.Pharmacy.Id,
                Name = param.Pharmacy.Name,
                Latitude = param.Pharmacy.Latitude,
                Longitude = param.Pharmacy.Longitude,
                ContactNumber = param.Pharmacy.ContactNumber ?? string.Empty,

                MatchedDrugs = param.Matched,
                TotalRequestedDrugs = param.Order.Items.Count,
                MatchPercentage = param.Order.Items.Count > 0
                    ? Math.Round(((double)param.Matched / param.Order.Items.Count) * 100, 1)
                    : 0,

                DistanceKm = param.DistanceKm,
                EstimatedDurationMinutes = Math.Round(param.DurationMinutes, 1),
                DeliveryFee = Math.Round(param.DeliveryFee, 2),

                FoundMedicines = param.Found,
                NotFoundMedicines = param.NotFound,

                RoutePath = param.RouteShape
                    .Select(p => new RoutePointDto
                    {
                        Lat = p.lat,
                        Lng = p.lng
                    })
                    .ToList()
            };
        }
    }
}
