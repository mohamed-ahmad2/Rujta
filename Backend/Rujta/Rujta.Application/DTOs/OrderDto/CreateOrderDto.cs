using Rujta.Domain.Entities;

namespace Rujta.Application.DTOs.OrderDto
{
    public class CreateOrderDto
    {
        public int PharmacyID { get; set; }
        public int? PrescriptionID { get; set; }
        public int? DeliveryAddressId { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

}
