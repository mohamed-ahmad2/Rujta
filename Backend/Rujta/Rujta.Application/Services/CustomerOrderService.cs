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

        public async Task<CustomerOrderResponse> CreateCustomerOrderAsync(CreateCustomerOrderRequest request, CancellationToken cancellationToken = default)
        {
            var customer = await _unitOfWork.Customers
                .GetByPhoneAsync(request.PhoneNumber, request.PharmacyId);

            bool isNewCustomer = false;

            if (customer == null)
            {
                isNewCustomer = true;

                customer = new Customer
                {
                    Name = request.FullName,
                    PhoneNumber = request.PhoneNumber,
                    PharmacyId = request.PharmacyId
                };

                await _unitOfWork.Customers.AddAsync(customer);
                await _unitOfWork.SaveAsync(cancellationToken);
            }

            var createOrderDto = new CreateOrderDto
            {
                PharmacyID = request.PharmacyId,
                OrderItems = request.Items.Select(i => new OrderItemDto
                {
                    MedicineID = i.MedicineID,
                    Quantity = i.Quantity
                }).ToList(),
                DeliveryAddressId = null
            };

            var orderDto = await _orderService.CreateOrderAsync(createOrderDto, customer.Id, cancellationToken);

            return new CustomerOrderResponse
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name,
                IsNewCustomer = isNewCustomer,
                OrderId = orderDto.Id,
                Message = isNewCustomer
                    ? "Customer created and order saved successfully"
                    : "Order saved successfully"
            };
        }

        public async Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId,string phoneNumber,CancellationToken cancellationToken = default)
        {
            var customer = await _unitOfWork.Customers.GetByPhoneAsync(phoneNumber, pharmacyId);

            if (customer != null)
            {
                return new CheckCustomerResponse
                {
                    Exists = true,
                    CustomerId = customer.Id,
                    FullName = customer.Name
                };
            }

            return new CheckCustomerResponse
            {
                Exists = false
            };
        }
    }
}
