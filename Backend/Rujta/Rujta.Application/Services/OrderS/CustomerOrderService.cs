using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Interfaces.InterfaceServices.IOrder;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class CustomerOrderService : ICustomerOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderService _orderService;

        public CustomerOrderService(IUnitOfWork unitOfWork, IOrderService orderService)
        {
            _unitOfWork = unitOfWork;
            _orderService = orderService;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync()
        {
            var customers = await _unitOfWork.Customers.GetAllAsync();
            var list = new List<CustomerDto>();

            foreach (var c in customers)
            {
                var orders = await _unitOfWork.Customers.GetCustomerOrdersAsync(c.Id);
                list.Add(new CustomerDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber,
                    OrdersPlaced = orders.Count(),
                    TotalSpend = orders.Sum(o => o.TotalPrice),
                    LastOrderDate = orders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate.ToString("dd-MM-yyyy") ?? ""
                });
            }

            return list;
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(Guid id)
        {
            var c = await _unitOfWork.Customers.GetByIdAsync(id);
            if (c == null) return null;

            var orders = await _unitOfWork.Customers.GetCustomerOrdersAsync(c.Id);
            return new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                OrdersPlaced = orders.Count(),
                TotalSpend = orders.Sum(o => o.TotalPrice),
                LastOrderDate = orders.OrderByDescending(o => o.OrderDate).FirstOrDefault()?.OrderDate.ToString("dd-MM-yyyy") ?? ""
            };
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                PhoneNumber = dto.PhoneNumber,
                Email = dto.Email,
                PharmacyId = dto.PharmacyId,
            };

            await _unitOfWork.Customers.AddAsync(customer);
            await _unitOfWork.SaveAsync();

            return new CustomerDto
            {
                Id = customer.Id,
                Name = customer.Name,
                Email = customer.Email,
                PhoneNumber = customer.PhoneNumber,
                OrdersPlaced = 0,
                TotalSpend = 0,
                LastOrderDate = ""
            };
        }

        public async Task<CustomerDto?> UpdateCustomerAsync(Guid id, UpdateCustomerDto dto)
        {
            var c = await _unitOfWork.Customers.GetByIdAsync(id);
            if (c == null) return null;

            c.Name = dto.Name;
            c.Email = dto.Email;
            c.PhoneNumber = dto.PhoneNumber;
            c.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Customers.UpdateAsync(c);
            await _unitOfWork.SaveAsync();

            return await GetCustomerByIdAsync(id);
        }

        public async Task<bool> DeleteCustomerAsync(Guid id)
        {
            var c = await _unitOfWork.Customers.GetByIdAsync(id);
            if (c == null) return false;

            await _unitOfWork.Customers.DeleteAsync(c);
            await _unitOfWork.SaveAsync();
            return true;
        }

        public async Task<CustomerStatsDto> GetCustomerStatsAsync()
        {
            var all = await _unitOfWork.Customers.GetAllAsync();
            var total = all.Count();
            var newCustomers = all.Count(c => (DateTime.UtcNow - c.CreatedAt).TotalDays <= 7);
            var returning = total - newCustomers;

            return new CustomerStatsDto
            {
                TotalCustomers = total,
                NewCustomers = newCustomers,
                ReturningCustomers = returning
            };
        }

        public async Task<CustomerOrderResponse> CreateCustomerOrderAsync(CreateCustomerOrderRequest request, CancellationToken cancellationToken = default)
        {
            var customer = await _unitOfWork.Customers.GetByPhoneAsync(request.PhoneNumber, request.PharmacyId);
            bool isNewCustomer = false;

            if (customer == null)
            {
                isNewCustomer = true;
                customer = new Customer
                {
                    Id = Guid.NewGuid(),
                    Name = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    PharmacyId = request.PharmacyId
                };
                await _unitOfWork.Customers.AddAsync(customer, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);
            }

            var orderDto = new CreateOrderDto
            {
                PharmacyID = request.PharmacyId,
                OrderItems = request.Items.Select(i => new OrderItemDto { MedicineID = i.MedicineID, Quantity = i.Quantity }).ToList(),
                DeliveryAddressId = null
            };

            var order = await _orderService.CreateOrderAsync(orderDto, customer.Id, cancellationToken);

            return new CustomerOrderResponse
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                IsNewCustomer = isNewCustomer,
                OrderId = order.Id,
                Message = isNewCustomer ? "Customer created and order saved successfully" : "Order saved successfully"
            };
        }

        public async Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId, string phoneNumber, CancellationToken cancellationToken = default)
        {
            var customer = await _unitOfWork.Customers.GetByPhoneAsync(phoneNumber, pharmacyId);
            if (customer != null)
                return new CheckCustomerResponse { Exists = true, CustomerId = customer.Id, FullName = customer.Name };
            return new CheckCustomerResponse { Exists = false };
        }
    }
}