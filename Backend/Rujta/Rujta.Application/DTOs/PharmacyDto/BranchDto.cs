namespace Rujta.Application.DTOs.PharmacyDtos
{
    public class BranchDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Location { get; set; }
        public string? ContactNumber { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public bool IsActive { get; set; }
        public string? ImageUrl { get; set; }
        public string? ManagerName { get; set; }
        public string? ManagerEmail { get; set; }
    }
}