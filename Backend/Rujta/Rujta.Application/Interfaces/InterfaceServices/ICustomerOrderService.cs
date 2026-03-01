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
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync();
        Task<CustomerDto?> GetCustomerByIdAsync(Guid id);
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto);
        Task<CustomerDto?> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto);
        Task<bool> DeleteCustomerAsync(Guid id);
        Task<CustomerStatsDto> GetCustomerStatsAsync();
        Task<CustomerOrderResponse> CreateCustomerOrderAsync(CreateCustomerOrderRequest request, CancellationToken cancellationToken = default);
        Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId, string phoneNumber, CancellationToken cancellationToken = default);
    }
}
