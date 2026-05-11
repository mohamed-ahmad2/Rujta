namespace Rujta.Domain.Entities
{
    public class PricingConfig
    {
        public int Id { get; set; }

        // Subscription
        public decimal SubscriptionMonthlyPrice { get; set; } = 1500;
        public decimal SubscriptionYearlyPrice { get; set; } = 14400;

        // Ad Plans
        public decimal AdWeeklyPrice { get; set; } = 99;
        public decimal AdBiweeklyPrice { get; set; } = 179;
        public decimal AdMonthlyPrice { get; set; } = 299;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}