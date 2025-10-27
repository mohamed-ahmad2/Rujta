<<<<<<< HEAD
﻿using System;
using System.Collections.Generic;
using System.Linq;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Services;
=======
﻿using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using System;
using System;
using System.Collections.Generic;
using System.Collections.Generic;
using System.Linq;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
>>>>>>> origin/main

namespace Rujta.Application.Services
{
    public class PharmacyDistanceService
    {
        private readonly IPharmacyRepository _pharmacyRepository;
<<<<<<< HEAD
        private readonly ItineroRoutingService _itineroService;

        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository, ItineroRoutingService itineroService)
        {
            _pharmacyRepository = pharmacyRepository;
            _itineroService = itineroService;
=======

        public PharmacyDistanceService(IPharmacyRepository pharmacyRepository)
        {
            _pharmacyRepository = pharmacyRepository;
>>>>>>> origin/main
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

<<<<<<< HEAD
        public List<(Pharmacy pharmacy, double distance, double duration)> GetNearestPharmacies(double userLat, double userLon, int topK = 10)
        {
            // 1️⃣ — فلترة أولية بالـ Haversine
            var preFiltered = _pharmacyRepository.GetAllPharmacies()
                .Select(p => new
                {
                    Pharmacy = p,
                    ApproxDistance = HaversineDistance(userLat, userLon, p.Latitude, p.Longitude)
                })
                .OrderBy(x => x.ApproxDistance)
                .Take(topK * 3)
                .ToList();

            // 2️⃣ — حساب دقيق باستخدام Itinero
            var accurate = new List<(Pharmacy pharmacy, double distance, double duration)>();

            foreach (var p in preFiltered)
            {
                var (distance, duration) = _itineroService.GetRouteData(userLat, userLon, p.Pharmacy.Latitude, p.Pharmacy.Longitude);

                if (distance != double.MaxValue)
                    accurate.Add((p.Pharmacy, distance, duration));
            }

            return accurate.OrderBy(x => x.distance).Take(topK).ToList();
        }
    }
}
=======

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
>>>>>>> origin/main
