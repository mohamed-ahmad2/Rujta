using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IPaymobService
    {
        Task<PaymobPaymentResult> CreatePaymentAsync(decimal amount);
        Task HandleCallbackAsync(JsonElement data);
    }
}
