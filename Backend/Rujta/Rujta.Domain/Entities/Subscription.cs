using Rujta.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Rujta.Domain.Enums;
namespace Rujta.Domain.Entities
{
    
    namespace Rujta.Domain.Entities
    {
        public class Subscription : BaseEntity
        {
            public int PharmacyId { get; set; }
            public Pharmacy Pharmacy { get; set; } = null!;

            public SubscriptionPlan Plan { get; set; }
            public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Pending;

            public DateTime StartDate { get; set; }
            public DateTime EndDate { get; set; }
        }
    }
}
