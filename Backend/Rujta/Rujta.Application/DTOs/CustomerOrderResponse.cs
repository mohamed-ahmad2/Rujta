using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class CustomerOrderResponse
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public bool IsNewCustomer { get; set; }
        public int OrderId { get; set; }
        public string Message { get; set; } = string.Empty;
    }

}
