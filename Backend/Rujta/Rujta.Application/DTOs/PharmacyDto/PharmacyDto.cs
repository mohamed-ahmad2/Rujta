namespace Rujta.Application.DTOs.PharmacyDtos 
{
    public class PharmacyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Location { get; set; }
        public string? ContactNumber { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; } = false;
        public string? ImageUrl { get; set; }
        public Guid? AdminId { get; set; }
        public double TotalOrders { get; set; }
    }
}