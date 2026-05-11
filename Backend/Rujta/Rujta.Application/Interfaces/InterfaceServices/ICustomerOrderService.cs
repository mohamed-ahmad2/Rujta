using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.OrderDto;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ICustomerOrderService
    {
        Task<IEnumerable<CustomerDto>> GetAllCustomersAsync(int pharmacyId);
        Task<CustomerDto?> GetCustomerByIdAsync(int pharmacyId, Guid id);
        Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto);
        Task<CustomerDto?> UpdateCustomerAsync(int pharmacyId, Guid id, UpdateCustomerDto dto);
        Task<bool> DeleteCustomerAsync(int pharmacyId, Guid id);
        Task<CustomerStatsDto> GetCustomerStatsAsync(int pharmacyId);
        Task<CustomerOrderResponse> CreateCustomerOrderAsync(CreateCustomerOrderRequest request, CancellationToken cancellationToken = default);
        Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId, string phoneNumber, CancellationToken cancellationToken = default);
        Task<IEnumerable<OrderDto>> GetCustomerOrdersAsync(
        Guid customerId,
        int pharmacyId,
        CancellationToken cancellationToken = default);
    }
}
