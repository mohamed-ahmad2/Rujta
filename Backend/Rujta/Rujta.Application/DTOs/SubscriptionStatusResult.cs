using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs
{
    public class SubscriptionStatusResult
    {
        public bool Found { get; set; }
        public SubscriptionStatus Status { get; set; }
        public SubscriptionPlan Plan { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public int DaysRemaining { get; set; }
    }
}
