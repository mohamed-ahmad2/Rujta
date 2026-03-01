using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class PaymobPaymentResult
    {
        public string MerchantOrderId { get; set; }
        public int PaymobOrderId { get; set; }
        public string PaymentToken { get; set; }
        public string PaymentUrl { get; set; }
    }
}
