using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Domain.Enums.Extensions
{
    public static class OrderStatusExtensions
    {
        public static string ToFriendlyString(this OrderStatus status) =>
            status switch
            {
                OrderStatus.Pending => "Pending Confirmation",
                OrderStatus.Accepted => "Accepted by Pharmacy",
                OrderStatus.Processing => "Being Prepared",
                OrderStatus.OutForDelivery => "Out for Delivery",
                OrderStatus.Delivered => "Delivered Successfully",
                OrderStatus.CancelledByUser => "Cancelled by User",
                OrderStatus.CancelledByPharmacy => "Cancelled by Pharmacy",
                _ => "Unknown"
            };
    }
}
