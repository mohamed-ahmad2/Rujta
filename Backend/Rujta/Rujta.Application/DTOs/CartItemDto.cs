namespace Rujta.Application.DTOs
{
    public class CartItemDto
    {
        public int MedicineId { get; set; }
        public int Quantity { get; set; }
    }
    public class ItemDto
    {
        public List<CartItemDto> Items { get; set; } = new();
    }
}
