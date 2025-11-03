using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class CheckoutDto
    {
        public Guid UserID { get; set; }              // The user placing the order
        public int PharmacyID { get; set; }           // The pharmacy receiving the order
        public string DeliveryAddress { get; set; } = string.Empty;
        public List<CartItemDto> CartItems { get; set; } = new();  // Medicines in the cart

    }
}
