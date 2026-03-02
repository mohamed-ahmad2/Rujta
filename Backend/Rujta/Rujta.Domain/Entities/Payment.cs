using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Domain.Entities
{
    public class Payment
    {
        public int Id { get; set; }
        public string MerchantOrderId { get; set; }
        public int PaymobOrderId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } // Pending, Paid, Failed
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
