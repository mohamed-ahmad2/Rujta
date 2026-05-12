using Rujta.Domain.Entities;

namespace Rujta.Application.DTOs.OrderDto
{
    public class CreateOrderDto
    {
        public int PharmacyID { get; set; }
        public Guid CustomerId { get; set; }
        public int? PrescriptionID { get; set; }
        public int? DeliveryAddressId { get; set; }
        public bool IsInStore { get; set; } = false;
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

}
