using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using System;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public class PharmacyDistanceService
    {
        private readonly IPharmacyRepository _pharmacyRepository;

        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository)
        {
            _pharmacyRepository = pharmacyRepository;
        }

        private static double HaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371000;
            double toRad = Math.PI / 180;
            double dLat = (lat2 - lat1) * toRad;
            double dLon = (lon2 - lon1) * toRad;

            double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                       Math.Cos(lat1 * toRad) * Math.Cos(lat2 * toRad) *
                       Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c;
        }


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