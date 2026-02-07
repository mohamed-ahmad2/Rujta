using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Services
{
    public static class DeliveryPricingService
    {
        public static double CalculateFee(double distanceKm)
        {
            double fee;

            if (distanceKm <= 5)
                fee = 20;
            else
                fee = 20 + (distanceKm - 5) * 1.2;

            return Math.Min(Math.Round(fee, 2), 40);
        }

    }

}
