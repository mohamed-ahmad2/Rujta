using Rujta.Domain.Entities;

namespace Rujta.Application.DTOs.SubscriptionDto
{
    public class SubscriptionResult
    {
        public int? SubscriptionId { get; set; }
        public bool Success { get; set; }
        public string? Message { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        public static SubscriptionResult Ok(int subscriptionId, DateTime start, DateTime end) =>
            new() { Success = true, SubscriptionId = subscriptionId, StartDate = start, EndDate = end };

        public static SubscriptionResult Fail(string message) =>
            new() { Success = false, Message = message };
    }
}
