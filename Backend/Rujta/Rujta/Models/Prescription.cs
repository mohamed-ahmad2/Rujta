using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models
{
    public enum PrescriptionStatus
    {
        Pending,
        Processed,
        Completed
    }

    public class Prescription
    {
        [Key]
        public int PrescriptionID { get; set; }

        [ForeignKey("Patient")]
        public string PatientID { get; set; } = string.Empty;

        [Required]
        public string DoctorName { get; set; } = string.Empty;

        public string? Diagnosis { get; set; }

        public DateTime DateIssued { get; set; }

        public string? PrescriptionImageURL { get; set; }

        public string? OCR_Text { get; set; }

        public PrescriptionStatus Status { get; set; }

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }

        public Person Patient { get; set; } = new Person();
    }
}
