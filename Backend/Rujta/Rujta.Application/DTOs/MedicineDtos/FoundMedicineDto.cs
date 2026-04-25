namespace Rujta.Application.DTOs.MedicineDtos
{
    public class FoundMedicineDto
    {
        public int MedicineId { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int RequestedQuantity { get; set; }
        public int AvailableQuantity { get; set; }

        public bool IsFullyAvailable => AvailableQuantity >= RequestedQuantity;

        public int ShortageQuantity => Math.Max(0, RequestedQuantity - AvailableQuantity);
    }
}