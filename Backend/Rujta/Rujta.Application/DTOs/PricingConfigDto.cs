using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class PricingConfigDto
    {
        public decimal SubscriptionMonthlyPrice { get; set; }
        public decimal SubscriptionYearlyPrice { get; set; }
        public decimal AdWeeklyPrice { get; set; }
        public decimal AdBiweeklyPrice { get; set; }
        public decimal AdMonthlyPrice { get; set; }
    }
}
