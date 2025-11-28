using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
