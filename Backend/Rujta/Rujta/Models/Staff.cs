namespace Rujta.Models
{
    public class Staff : Pharmacist
    {
        public string Position { get; set; } = string.Empty;
        public DateTime HireDate { get; set; }
        public decimal Salary { get; set; }

        public string? ManagerID { get; set; }
        public Manager? Manager { get; set; }

        public int? PharmacyID { get; set; }
        public Pharmacy? Pharmacy { get; set; }
    }
}
