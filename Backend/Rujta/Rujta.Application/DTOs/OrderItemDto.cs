namespace Rujta.Application.DTOs
{
    public class OrderItemDto
    {
        public int MedicineID { get; set; }
        public string MedicineName { get; set; } = string.Empty;
        public int Quantity { get; set; }
    }
}
