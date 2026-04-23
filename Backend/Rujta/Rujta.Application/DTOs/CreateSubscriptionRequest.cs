using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
   
        public class CreateSubscriptionRequest
        {
            public int PharmacyId { get; set; }
            public SubscriptionPlan Plan { get; set; }
        }
    
}
