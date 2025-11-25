using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class SalesSummaryDto
    {
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CanceledOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public decimal MaxOrderValue { get; set; }
        public decimal MinOrderValue { get; set; }

    }
}

