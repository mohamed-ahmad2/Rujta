using System;

namespace Rujta.Application.DTOs
{
    public class PharmacistDto
    {
        public int? Id { get; set; }
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        // Pharmacist-specific
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }  
        public decimal? Salary { get; set; }

        public Guid? ManagerID { get; set; }
        public int? PharmacyID { get; set; }
    }
}
