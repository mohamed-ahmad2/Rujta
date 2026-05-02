namespace Rujta.Application.DTOs.PharmacyDtos
{
    public class NearestPharmacyDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public double DistanceMeters { get; set; }
        public double DurationMinutes { get; set; }
        public string Mode { get; set; } = string.Empty;
    }
}