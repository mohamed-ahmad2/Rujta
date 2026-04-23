using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Rujta.Domain.Enums;

namespace Rujta.Application.DTOs
{
    public class RenewSubscriptionRequest
    {
        public int PharmacyId { get; set; }
        public SubscriptionPlan Plan { get; set; }
    }
}
