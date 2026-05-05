using Rujta.Application.DTOs.MedicineDtos;

namespace Rujta.Application.DTOs
{
     public class PrescriptionResultDto
    {
        public List<MedicineDto> AvailableMedicines { get; set; } = new();
        public List<string> NotFoundMedicines { get; set; } = new();
    }
}
