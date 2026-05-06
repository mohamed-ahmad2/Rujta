using Itinero.Osm.Vehicles;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Application.Models;

namespace Rujta.Application.Services.Pharmcy
{
    public class PharmacyDistanceService : IPharmacyDistanceService
    {
        private readonly IPharmacyRepository _pharmacyRepository;
        private readonly ItineroRoutingService _itineroService;
        private const double Epsilon = 1e-6;

        public PharmacyDistanceService(
            IPharmacyRepository pharmacyRepository,
            ItineroRoutingService itineroService)
        {
            _pharmacyRepository = pharmacyRepository;
            _itineroService = itineroService;
        }

        private static double HaversineDistance(
            double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000;
            double dLat = (lat2 - lat1) * Math.PI / 180.0;
            double dLon = (lon2 - lon1) * Math.PI / 180.0;

            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180.0) *
                Math.Cos(lat2 * Math.PI / 180.0) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            return 2 * R * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        }

   
        private static (double Lat, double Lng) GetCoordinates(Pharmacy p)
            => (p.Address?.Latitude ?? 0d, p.Address?.Longitude ?? 0d);
  

        private static bool IsNotZero(double value)
        {
            return Math.Abs(value) > Epsilon;
        }

        private static bool HasValidCoordinates(Pharmacy p)
        {
            return p.Address != null
                && (IsNotZero(p.Address.Latitude) || IsNotZero(p.Address.Longitude));
        }

        public async Task<List<PharmacyRouteResult>> GetNearestPharmaciesRouted(
            double userLat, double userLon,
            string mode = "car", int topK = 5)
        {
            var allPharmacies = await _pharmacyRepository.GetAllPharmacies();

            var topCandidates = allPharmacies
                .Where(HasValidCoordinates)
                .Select(p =>
                {
                    var (lat, lng) = GetCoordinates(p);
                    return new
                    {
                        Pharmacy = p,
                        Lat = lat,
                        Lng = lng,
                        ApproxDistance = HaversineDistance(
                            userLat, userLon, lat, lng)
                    };
                })
                .OrderBy(x => x.ApproxDistance)
                .Take(topK * 3)
                .ToList();

            var profile = mode.ToLower() switch
            {
                "walk" => Vehicle.Pedestrian.Fastest(),
                _ => Vehicle.Car.Fastest()
            };

            var results = new List<PharmacyRouteResult>();
            const double TOLERANCE = 1e-6;

            foreach (var entry in topCandidates)
            {
                var (dist, durSeconds) = _itineroService.GetRouteData(
                    userLat, userLon,
                    entry.Lat, entry.Lng,
                    profile
                );

                if (Math.Abs(dist - double.MaxValue) < TOLERANCE)
                {
                    dist = entry.ApproxDistance;
                    durSeconds = mode.ToLower() == "walk"
                        ? dist / 1.4
                        : dist / (25.0 * 1000 / 3600);
                }

                results.Add(new PharmacyRouteResult
                {
                    Pharmacy = entry.Pharmacy,
                    DistanceMeters = dist,
                    DurationSeconds = durSeconds,
                    Mode = mode
                });
            }

            return results
                .OrderBy(r => r.DistanceMeters)
                .Take(topK)
                .ToList();
        }
    }
}