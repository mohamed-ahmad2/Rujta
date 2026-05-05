namespace Rujta.Application.DTOs.SubscriptionDto
{
   
        public class CreateSubscriptionRequest
        {
            public int PharmacyId { get; set; }
            public SubscriptionPlan Plan { get; set; }
        }
    
}
