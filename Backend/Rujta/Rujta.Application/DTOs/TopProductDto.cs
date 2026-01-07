namespace Rujta.Application.DTOs
{
    public class TopProductDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
        public string? ImageUrl { get; set; }

        public decimal TotalRevenue { get; set; }
    }
}

