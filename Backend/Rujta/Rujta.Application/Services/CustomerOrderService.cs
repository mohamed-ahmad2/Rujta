using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services
{
    public class CustomerOrderService : ICustomerOrderService
    {
        private readonly IUnitOfWork _unitOfWork;


        public CustomerOrderService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;

        }

        public async Task<CustomerOrderResponse> CreateCustomerOrderAsync(
            CreateCustomerOrderRequest request,
            CancellationToken cancellationToken = default)
        {
            // 1️⃣ Get customer by phone + pharmacy
            var customer = await _unitOfWork.Customers
                .GetByPhoneAsync(request.PhoneNumber, request.PharmacyId);

            bool isNewCustomer = false;

            // 2️⃣ Create customer if not exists
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

            // 3️⃣ Create order
            var order = new Order
            {
                CustomerId = customer.Id,
                PharmacyID = request.PharmacyId,
                OrderItems = new List<OrderItem>()
            };

            // 4️⃣ Add order items
            foreach (var item in request.Items)
            {
                order.OrderItems.Add(new OrderItem
                {
                    MedicineID = item.MedicineID,
                    Quantity = item.Quantity
                });
            }

            // 5️⃣ Save order
            await _unitOfWork.Orders.AddAsync(order);
            await _unitOfWork.SaveAsync(cancellationToken);

            // 6️⃣ Response
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
         public async Task<CheckCustomerResponse> CheckCustomerByPhoneAsync(int pharmacyId, string phoneNumber, CancellationToken cancellationToken = default)
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
