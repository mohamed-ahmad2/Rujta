namespace Rujta.Application.DTOs
{
    public class CreateCustomerOrderRequest
    {
        public string FullName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public int PharmacyId { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

}
