using Rujta.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class OrderDto : BaseEntityDto
    {
        public Guid UserID { get; set; }
        public int PharmacyID { get; set; }
        public int? PrescriptionID { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalPrice { get; set; }
        public AddressDto DeliveryAddress { get; set; }
        public OrderStatus Status { get; set; }

        public string PharmacyName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;

        public List<OrderItemDto> OrderItems { get; set; } = new();
    }

}
