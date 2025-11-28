using System;

namespace Rujta.Application.DTOs
{
    public class StaffDto
    {
        // Use nullable types so we can tell "not provided" (null) vs "provided as value"
        public int? Id { get; set; }                // used for update/delete; null for Add

        // inherited from Pharmacist (make nullable so Add/Update can be partial)
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }

        // Staff-specific
        public string? Position { get; set; }
        public DateTime? HireDate { get; set; }     // if null on Add -> set DateTime.UtcNow or require
        public decimal? Salary { get; set; }

        public Guid? ManagerID { get; set; }
        public int? PharmacyID { get; set; }
    }
}
