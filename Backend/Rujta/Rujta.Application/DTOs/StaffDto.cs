using System;

namespace Rujta.Application.DTOs
{
    public class StaffDto
    {
        public Guid Id { get; set; }  // inherited from Pharmacist

        public string FullName { get; set; } = string.Empty; // inherited from Pharmacist
        public string Email { get; set; } = string.Empty; // inherited from Pharmacist
        public string PhoneNumber { get; set; } = string.Empty; // inherited from Pharmacist

        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        public Guid? ManagerID { get; set; }
        public int? PharmacyID { get; set; }

        // Optional: include names for easier display in UI
        public string? ManagerName { get; set; }
        public string? PharmacyName { get; set; }
    }
}
