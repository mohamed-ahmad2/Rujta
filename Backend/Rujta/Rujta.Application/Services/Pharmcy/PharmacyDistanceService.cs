using Itinero.Osm.Vehicles;
using Rujta.Application.Interfaces.InterfaceServices.IPharmacy;
using Rujta.Application.Models;

namespace Rujta.Application.Services.Pharmcy
{
    public class PharmacyDistanceService : IPharmacyDistanceService
    {
        private readonly IPharmacyRepository _pharmacyRepository;
        private readonly ItineroRoutingService _itineroService;

        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository,ItineroRoutingService itineroService)
        {
            _pharmacyRepository = pharmacyRepository;
            _itineroService = itineroService;
        }

        private static double HaversineDistance(double lat1, double lon1,double lat2, double lon2)
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

        public async Task<List<PharmacyRouteResult>> GetNearestPharmaciesRouted(double userLat, double userLon,string mode = "car", int topK = 5)
        {
            var allPharmacies = await _pharmacyRepository.GetAllPharmacies();

            var topCandidates = allPharmacies
                .Select(p => new
                {
                    Pharmacy = p,
                    ApproxDistance = HaversineDistance(
                        userLat, userLon, p.Latitude, p.Longitude)
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
                    entry.Pharmacy.Latitude, entry.Pharmacy.Longitude,
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