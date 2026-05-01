namespace Rujta.Application.Models
{
    public class PharmacyRouteResult
    {
        public Pharmacy Pharmacy { get; set; } = null!;
        public double DistanceMeters { get; set; }
        public double DurationSeconds { get; set; }
        public string Mode { get; set; } = string.Empty;

        public double DurationMinutes => DurationSeconds / 60.0;
    }
}