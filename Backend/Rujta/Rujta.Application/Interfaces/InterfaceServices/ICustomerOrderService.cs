using Rujta.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ICustomerOrderService
    {
        Task<CustomerOrderResponse> CreateCustomerOrderAsync(
            CreateCustomerOrderRequest request,
            CancellationToken cancellationToken = default);
        Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId, string phoneNumber, CancellationToken cancellationToken = default);

    }

}
