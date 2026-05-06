namespace Rujta.Application.DTOs.PharmacyDtos
{
    public class PharmacyTreeDto
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Location { get; set; }
        public bool IsActive { get; set; }
        public string? ManagerName { get; set; }
        public List<PharmacyTreeDto> Branches { get; set; } = new();
    }
}