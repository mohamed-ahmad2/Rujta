namespace Rujta.Application.DTOs
{
    public class CreateOrderDto
    {
        public int PharmacyID { get; set; }
        public int? PrescriptionID { get; set; }
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

}
