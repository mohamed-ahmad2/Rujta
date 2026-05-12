using AutoMapper;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.OrderDto;
using Rujta.Application.Interfaces.InterfaceServices.IOrder;

namespace Rujta.Application.Services
{
    public class CustomerOrderService : ICustomerOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IOrderService _orderService;
        private readonly IMapper _mapper;
        private readonly ILogger<CustomerOrderService> _logger;

        public CustomerOrderService(
            IUnitOfWork unitOfWork,
            IOrderService orderService,
            IMapper mapper,
            ILogger<CustomerOrderService> logger)
        {
            _unitOfWork = unitOfWork;
            _orderService = orderService;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<CustomerDto>> GetAllCustomersAsync(int pharmacyId)
        {
            _logger.LogInformation("Start GetAllCustomersAsync for PharmacyId: {PharmacyId}", pharmacyId);

            var customers = await _unitOfWork.Customers
                .FindAsync(c => c.PharmacyId == pharmacyId);

            _logger.LogInformation("Fetched {Count} customers for PharmacyId: {PharmacyId}", customers.Count(), pharmacyId);

            var list = new List<CustomerDto>();

            foreach (var c in customers)
            {
                _logger.LogDebug("Processing customer {CustomerId}", c.Id);

                var orders = await _unitOfWork.Customers.GetCustomerOrdersAsync(c.Id, pharmacyId);

                _logger.LogDebug("Customer {CustomerId} has {OrderCount} orders", c.Id, orders.Count());

                list.Add(new CustomerDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Email = c.Email,
                    PhoneNumber = c.PhoneNumber,
                    OrdersPlaced = orders.Count(),
                    TotalSpend = orders.Sum(o => o.TotalPrice),
                    LastOrderDate = orders
                        .OrderByDescending(o => o.OrderDate)
                        .FirstOrDefault()?.OrderDate.ToString("dd-MM-yyyy") ?? ""
                });
            }

            _logger.LogInformation("Completed GetAllCustomersAsync for PharmacyId: {PharmacyId}", pharmacyId);

            return list;
        }

        public async Task<CustomerDto?> GetCustomerByIdAsync(int pharmacyId, Guid id)
        {
            _logger.LogInformation("GetCustomerByIdAsync started | CustomerId: {CustomerId} | PharmacyId: {PharmacyId}", id, pharmacyId);

            var c = await _unitOfWork.Customers
                .FindOneAsync(x => x.Id == id && x.PharmacyId == pharmacyId);

            if (c == null)
            {
                _logger.LogWarning("Customer not found | CustomerId: {CustomerId} | PharmacyId: {PharmacyId}", id, pharmacyId);
                return null;
            }

            _logger.LogInformation("Customer found | CustomerId: {CustomerId} | Name: {Name}", c.Id, c.Name);

            var orders = await _unitOfWork.Customers.GetCustomerOrdersAsync(c.Id, pharmacyId);

            _logger.LogInformation("Orders loaded | CustomerId: {CustomerId} | Orders: {Count}", c.Id, orders.Count());

            var result = new CustomerDto
            {
                Id = c.Id,
                Name = c.Name,
                Email = c.Email,
                PhoneNumber = c.PhoneNumber,
                OrdersPlaced = orders.Count(),
                TotalSpend = orders.Sum(o => o.TotalPrice),
                LastOrderDate = orders
                    .OrderByDescending(o => o.OrderDate)
                    .FirstOrDefault()?.OrderDate.ToString("dd-MM-yyyy") ?? ""
            };

            _logger.LogInformation("Customer DTO built successfully | CustomerId: {CustomerId}", id);

            return result;
        }

        public async Task<CustomerDto> CreateCustomerAsync(CreateCustomerDto dto)
        {
            _logger.LogInformation("CreateCustomerAsync started | Phone: {Phone}", dto.PhoneNumber);

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

            _logger.LogInformation("Customer created successfully | CustomerId: {CustomerId}", customer.Id);

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

        public async Task<CustomerDto?> UpdateCustomerAsync(int pharmacyId, Guid id, UpdateCustomerDto dto)
        {
            _logger.LogInformation("UpdateCustomerAsync started | CustomerId: {CustomerId}", id);

            var c = await _unitOfWork.Customers
                .FindOneAsync(x => x.Id == id && x.PharmacyId == pharmacyId);

            if (c == null)
            {
                _logger.LogWarning("Update failed - customer not found | CustomerId: {CustomerId}", id);
                return null;
            }

            c.Name = dto.Name;
            c.Email = dto.Email;
            c.PhoneNumber = dto.PhoneNumber;
            c.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.Customers.UpdateAsync(c);
            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Customer updated successfully | CustomerId: {CustomerId}", id);

            return await GetCustomerByIdAsync(pharmacyId, id);
        }

        public async Task<bool> DeleteCustomerAsync(int pharmacyId, Guid id)
        {
            _logger.LogInformation("DeleteCustomerAsync started | CustomerId: {CustomerId}", id);

            var c = await _unitOfWork.Customers
                .FindOneAsync(x => x.Id == id && x.PharmacyId == pharmacyId);

            if (c == null)
            {
                _logger.LogWarning("Delete failed - customer not found | CustomerId: {CustomerId}", id);
                return false;
            }

            await _unitOfWork.Customers.DeleteAsync(c);
            await _unitOfWork.SaveAsync();

            _logger.LogInformation("Customer deleted successfully | CustomerId: {CustomerId}", id);

            return true;
        }

        public async Task<CustomerStatsDto> GetCustomerStatsAsync(int pharmacyId)
        {
            _logger.LogInformation("GetCustomerStatsAsync started | PharmacyId: {PharmacyId}", pharmacyId);

            var all = await _unitOfWork.Customers
                .FindAsync(c => c.PharmacyId == pharmacyId);

            var total = all.Count();
            var newCustomers = all.Count(c => (DateTime.UtcNow - c.CreatedAt).TotalDays <= 7);
            var returning = total - newCustomers;

            _logger.LogInformation(
                "Stats calculated | Total: {Total}, New: {New}, Returning: {Returning}",
                total, newCustomers, returning);

            return new CustomerStatsDto
            {
                TotalCustomers = total,
                NewCustomers = newCustomers,
                ReturningCustomers = returning
            };
        }

        public async Task<CustomerOrderResponse> CreateCustomerOrderAsync(
            CreateCustomerOrderRequest request,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("CreateCustomerOrderAsync started | Phone: {Phone}", request.PhoneNumber);

            var customer = await _unitOfWork.Customers
                .GetByPhoneAsync(request.PhoneNumber, request.PharmacyId);

            bool isNewCustomer = false;

            if (customer == null)
            {
                _logger.LogInformation("Customer not found, creating new customer...");

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

                _logger.LogInformation("New customer created | CustomerId: {CustomerId}", customer.Id);
            }
            else
            {
                _logger.LogInformation("Existing customer found | CustomerId: {CustomerId}", customer.Id);
            }

            var orderDto = new CreateOrderDto
            {
                CustomerId = customer.Id,
                PharmacyID = request.PharmacyId,
                OrderItems = request.Items.Select(i => new OrderItemDto
                {
                    MedicineID = i.MedicineID,
                    Quantity = i.Quantity
                }).ToList(),
                DeliveryAddressId = null,
                IsInStore = true
            };

            _logger.LogInformation("Creating order for customer {CustomerId}", customer.Id);

            var order = await _orderService.CreateOrderAsync(orderDto, Guid.Empty, cancellationToken);

            _logger.LogInformation("Order created successfully | OrderId: {OrderId}", order.Id);

            return new CustomerOrderResponse
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                IsNewCustomer = isNewCustomer,
                OrderId = order.Id,
                Message = isNewCustomer
                    ? "Customer created and order saved successfully"
                    : "Order saved successfully"
            };
        }

 
        public async Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(
            int pharmacyId,
            string phoneNumber,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("CheckCustomerByPhoneAsync | Phone: {Phone}", phoneNumber);

            var customer = await _unitOfWork.Customers
                .GetByPhoneAsync(phoneNumber, pharmacyId);

            if (customer != null)
            {
                _logger.LogInformation("Customer exists | CustomerId: {CustomerId}", customer.Id);

                return new CheckCustomerResponse
                {
                    Exists = true,
                    CustomerId = customer.Id,
                    FullName = customer.Name
                };
            }

            _logger.LogWarning("Customer not found | Phone: {Phone}", phoneNumber);

            return new CheckCustomerResponse { Exists = false };
        }

        public async Task<IEnumerable<OrderDto>> GetCustomerOrdersAsync(
            Guid customerId,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("GetCustomerOrdersAsync | CustomerId: {CustomerId}", customerId);

            var orders = await _unitOfWork.Customers
                .GetCustomerOrdersAsync(customerId, pharmacyId, cancellationToken);

            _logger.LogInformation("Orders fetched | Count: {Count}", orders.Count());

            return _mapper.Map<IEnumerable<OrderDto>>(orders);
        }
    }
}