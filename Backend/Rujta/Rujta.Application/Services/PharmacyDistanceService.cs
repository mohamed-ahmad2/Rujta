using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Rujta.Application.Services
{
    public class PharmacyDistanceService
    {
        private readonly IPharmacyRepository _pharmacyRepository;
        private readonly ItineroRoutingService? _itineroService;

        // Constructor with routing service
        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository, ItineroRoutingService itineroService)
        {
            _pharmacyRepository = pharmacyRepository;
            _itineroService = itineroService;
        }

        // Constructor without routing service
        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository)
        {
            _pharmacyRepository = pharmacyRepository;
        }

        private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000; // meters
            double toRad = Math.PI / 180;
            double dLat = (lat2 - lat1) * toRad;
            double dLon = (lon2 - lon1) * toRad;

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1 * toRad) * Math.Cos(lat2 * toRad) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }

        // Using Itinero routing service
        public List<(Pharmacy pharmacy, double distance, double duration)> GetNearestPharmaciesWithRoute(double userLat, double userLon, int topK = 10)
        {
            if (_itineroService == null)
                throw new InvalidOperationException("Routing service is not available.");

            var preFiltered = _pharmacyRepository.GetAllPharmacies()
                .Select(p => new
                {
                    Pharmacy = p,
                    ApproxDistance = HaversineDistance(userLat, userLon, p.Latitude, p.Longitude)
                })
                .OrderBy(x => x.ApproxDistance)
                .Take(topK * 3)
                .ToList();

            const double TOLERANCE = 1e-6;

            var accurate = preFiltered
                .Select(p =>
                {
                    var (distance, duration) = _itineroService.GetRouteData(userLat, userLon, p.Pharmacy.Latitude, p.Pharmacy.Longitude);
                    return (p.Pharmacy, distance, duration);
                })
                .Where(x => Math.Abs(x.distance - double.MaxValue) > TOLERANCE)
                .OrderBy(x => x.distance)
                .Take(topK)
                .ToList();


            return accurate.OrderBy(x => x.distance).Take(topK).ToList();
        }

        // Only Haversine distance
        public List<(Pharmacy pharmacy, double distance)> GetNearestPharmacies(double userLat, double userLon, int topK = 5)
        {
            var pharmacies = _pharmacyRepository.GetAllPharmacies();

            return pharmacies
                .Select(p => (pharmacy: p, distance: HaversineDistance(userLat, userLon, p.Latitude, p.Longitude)))
                .OrderBy(x => x.distance)
                .Take(topK)
                .ToList();
        }
    }
}
