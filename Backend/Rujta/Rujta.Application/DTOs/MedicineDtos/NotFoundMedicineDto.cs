namespace Rujta.Application.DTOs.MedicineDtos
{
    public class NotFoundMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int RequestedQuantity { get; set; }
    }
}