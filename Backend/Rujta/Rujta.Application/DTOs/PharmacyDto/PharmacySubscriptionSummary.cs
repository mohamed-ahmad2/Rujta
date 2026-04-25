using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs.PharmacyDto
{
    public class PharmacySubscriptionSummary
    {
        public int PharmacyId { get; set; }
        public string PharmacyName { get; set; } = string.Empty;
        public bool PharmacyIsActive { get; set; }
        public SubscriptionStatus SubscriptionStatus { get; set; }
        public SubscriptionPlan Plan { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int DaysRemaining { get; set; }
    }
}
