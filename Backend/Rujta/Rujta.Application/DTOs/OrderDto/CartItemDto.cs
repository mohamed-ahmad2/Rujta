namespace Rujta.Application.DTOs.OrderDto
{
    public class CartItemDto
    {
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
        public int? PharmacyId { get; set; }
    }
    public class ItemDto
    {
        public List<CartItemDto> Items { get; set; } = new();
    }
}
