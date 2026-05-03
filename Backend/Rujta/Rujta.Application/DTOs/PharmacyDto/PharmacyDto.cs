namespace Rujta.Application.DTOs.PharmacyDtos
{
    public class PharmacyDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Location { get; set; }
        public string? ContactNumber { get; set; }
        public string? OpenHours { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }
        public bool IsDeleted { get; set; }
        public string? ImageUrl { get; set; }
        public int TotalOrders { get; set; }

    
        public Guid? AdminId { get; set; }
        public string? AdminName { get; set; }
        public string? AdminEmail { get; set; }

        public Guid? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public string? ManagerEmail { get; set; }
        public string? ManagerPhone { get; set; }
    }
}