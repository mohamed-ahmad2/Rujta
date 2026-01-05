using Rujta.Domain.Entities;

namespace Rujta.Application.DTOs
{
    public class CreateOrderDto
    {
        public int PharmacyID { get; set; }
        public int? PrescriptionID { get; set; }
        public AddressDto? DeliveryAddress { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

}
