namespace Rujta.Application.DTOs.SubscriptionDto
{
    public class SetStatusManuallyRequest
    {
        public int PharmacyId { get; set; }
        public bool Activate { get; set; }
    }
}