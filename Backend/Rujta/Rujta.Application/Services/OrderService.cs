using AutoMapper;
using Microsoft.Extensions.Logging;
using Rujta.Application.Constants;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;

namespace Rujta.Application.Services
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<OrderService> _logger;

        public OrderService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<OrderService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
        }


        public async Task<OrderDto> CreateOrderAsync(CreateOrderDto createOrderDto, Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Creating new order for UserId {UserId}", userId);

                var appUser = await _unitOfWork.People.GetByGuidAsync(userId, cancellationToken)
                    ?? throw new InvalidOperationException($"User with ID {userId} not found.");

                var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(createOrderDto.PharmacyID, cancellationToken)
                    ?? throw new InvalidOperationException($"Pharmacy with ID {createOrderDto.PharmacyID} not found.");

                Address? deliveryAddressEntity = null;

                if (createOrderDto.DeliveryAddress != null)
                {
                    deliveryAddressEntity = (await _unitOfWork.Address.FindAsync(
                        a => a.UserId == userId,
                        cancellationToken
                    )).FirstOrDefault();

                    if (deliveryAddressEntity != null)
                    {
                        deliveryAddressEntity.Street = createOrderDto.DeliveryAddress.Street;
                        deliveryAddressEntity.BuildingNo = createOrderDto.DeliveryAddress.BuildingNo;
                        deliveryAddressEntity.City = createOrderDto.DeliveryAddress.City;
                        deliveryAddressEntity.Governorate = createOrderDto.DeliveryAddress.Governorate;
                        deliveryAddressEntity.IsDefault = true;
                        await _unitOfWork.Address.UpdateAsync(deliveryAddressEntity, cancellationToken);
                    }
                    else
                    {
                        deliveryAddressEntity = _mapper.Map<Address>(createOrderDto.DeliveryAddress);
                        deliveryAddressEntity.UserId = userId;
                        deliveryAddressEntity.IsDefault = true;
                        await _unitOfWork.Address.AddAsync(deliveryAddressEntity, cancellationToken);
                    }
                }

               
                var order = new Order
                {
                    UserID = userId,
                    PharmacyID = createOrderDto.PharmacyID,
                    OrderDate = DateTime.UtcNow,
                    Status = OrderStatus.Pending,
                    DeliveryAddressId = deliveryAddressEntity?.Id,
                    OrderItems = new List<OrderItem>()
                };

                
                decimal totalPrice = 0;
                var medicineIds = createOrderDto.OrderItems.Select(i => i.MedicineID).ToList();
                var medicines = await _unitOfWork.Medicines.FindAsync(m => medicineIds.Contains(m.Id), cancellationToken);
                var medicineDict = medicines.ToDictionary(m => m.Id);

                foreach (var itemDto in createOrderDto.OrderItems)
                {
                    if (!medicineDict.TryGetValue(itemDto.MedicineID, out var medicine))
                        throw new InvalidOperationException($"Medicine with ID {itemDto.MedicineID} not found.");

                    var orderItem = new OrderItem
                    {
                        MedicineID = medicine.Id,
                        Quantity = itemDto.Quantity,
                        PricePerUnit = medicine.Price,
                        SubTotal = itemDto.Quantity * medicine.Price
                    };

                    order.OrderItems.Add(orderItem);
                    totalPrice += orderItem.SubTotal;
                }

                order.TotalPrice = totalPrice;

                
                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} created successfully for UserId {UserId}",order.Id.ToString(),userId.ToString());


                var orderDto = _mapper.Map<OrderDto>(order);
                orderDto.UserName = appUser.Name;
                orderDto.PharmacyName = pharmacy.Name;

                return orderDto;
            }
            catch (Exception ex)
            {
                var message = $"Failed to create order for UserId {userId}";
                _logger.LogError(ex, message);
                throw new InvalidOperationException(message, ex);
            }
        }



        public async Task<(bool success, string message)> AcceptOrderAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Attempting to accept order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found while accepting", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.Accepted))
                {
                    _logger.LogWarning("Invalid status transition for Order {OrderId} - from {Current} to Accepted", id, order.Status);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.Accepted;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} accepted successfully", id);
                return (true, OrderMessages.OrderAccepted);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while accepting order {OrderId}", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<(bool success, string message)> CancelOrderByUserAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("User requested cancellation for Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for user cancellation", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.CancelledByUser))
                {
                    _logger.LogWarning("Invalid cancellation request by user for Order {OrderId}", id);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.CancelledByUser;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} cancelled by user successfully", id);
                return (true, OrderMessages.OrderCancelByUser);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while cancelling order {OrderId} by user", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<(bool success, string message)> CancelOrderByPharmacyAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Pharmacy attempting to cancel Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for pharmacy cancellation", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.CancelledByPharmacy))
                {
                    _logger.LogWarning("Invalid pharmacy cancellation for Order {OrderId} (Current Status: {Status})", id, order.Status);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.CancelledByPharmacy;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} successfully cancelled by pharmacy", id);
                return (true, OrderMessages.OrderCancelByPharmacy);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while pharmacy cancelling Order {OrderId}", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<(bool success, string message)> ProcessOrderAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Processing Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for processing", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.Processing))
                {
                    _logger.LogWarning("Invalid status change to PROCESSING for Order {OrderId}", id);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.Processing;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} is now Processing", id);
                return (true, OrderMessages.OrderProcessNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while processing Order {OrderId}", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<(bool success, string message)> OutForDeliveryAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Setting Order {OrderId} as OutForDelivery", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for out-for-delivery", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.OutForDelivery))
                {
                    _logger.LogWarning("Invalid transition to OutForDelivery for Order {OrderId}", id);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.OutForDelivery;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} is now OutForDelivery", id);
                return (true, OrderMessages.OrderOutForDelivery);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while setting Order {OrderId} out for delivery", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<(bool success, string message)> MarkAsDeliveredAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Marking Order {OrderId} as Delivered", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found to mark delivered", id);
                    return (false, OrderMessages.OrderNotFound);
                }

                if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                {
                    _logger.LogWarning("Invalid status transition to Delivered for Order {OrderId}", id);
                    return (false, OrderMessages.InvalidStateTransition);
                }

                order.Status = OrderStatus.Delivered;
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} marked as Delivered", id);
                return (true, OrderMessages.OrderMarkAsDelivered);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while delivering Order {OrderId}", id);
                return (false, "An unexpected error occurred.");
            }
        }


        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching orders for User {UserId}", userId);

                var orders = await _unitOfWork.Orders.GetOrdersByUserIdAsync(userId, cancellationToken);
                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get orders for User {UserId}", userId);
                throw new InvalidOperationException($"An error occurred while fetching orders for User {userId}.", ex);
            }
        }


        public async Task<OrderDto?> GetOrderDetailsAsync(int orderId, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching details for Order {OrderId}", orderId);

                var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(orderId, cancellationToken);
                return _mapper.Map<OrderDto?>(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get details for Order {OrderId}", orderId);
                throw new InvalidOperationException($"An error occurred while fetching details for Order {orderId}.", ex);
            }
        }


        public async Task<IEnumerable<OrderDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching all orders");

                var orders = await _unitOfWork.Orders.GetAllWithItemsAsync(cancellationToken);
                return _mapper.Map<IEnumerable<OrderDto>>(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching all orders");
                throw new InvalidOperationException("An error occurred while fetching all orders.", ex);
            }
        }


        public async Task<OrderDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Fetching Order by Id {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                return order is null ? null : _mapper.Map<OrderDto>(order);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while fetching Order {OrderId}", id);
                throw new InvalidOperationException($"An error occurred while fetching Order {id}.", ex);
            }

        }


        public async Task AddAsync(OrderDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Adding new Order");

                var order = _mapper.Map<Order>(dto);
                await _unitOfWork.Orders.AddAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order added successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while adding Order");
                throw new InvalidOperationException("An error occurred while adding an order.", ex);
            }

        }


        public async Task UpdateAsync(int id, OrderDto dto, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Updating Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for update", id);
                    return;
                }

                _mapper.Map(dto, order);
                await _unitOfWork.Orders.UpdateAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} updated successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating Order {OrderId}", id);
                throw new InvalidOperationException($"Failed to update order {id}", ex);
            }

        }


        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            try
            {
                _logger.LogInformation("Deleting Order {OrderId}", id);

                var order = await _unitOfWork.Orders.GetByIdAsync(id, cancellationToken);
                if (order == null)
                {
                    _logger.LogWarning("Order {OrderId} not found for deletion", id);
                    return;
                }

                await _unitOfWork.Orders.DeleteAsync(order, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _logger.LogInformation("Order {OrderId} deleted successfully", id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while deleting Order {OrderId}", id);
                throw new InvalidOperationException($"An error occurred while deleting Order {id}.", ex);
            }

        }


        private static bool CanChangeStatus(OrderStatus current, OrderStatus next)
        {
            return (current, next) switch
            {
                (OrderStatus.Pending, OrderStatus.Accepted) => true,
                (OrderStatus.Accepted, OrderStatus.Processing) => true,
                (OrderStatus.Processing, OrderStatus.OutForDelivery) => true,
                (OrderStatus.OutForDelivery, OrderStatus.Delivered) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByUser) => true,
                (OrderStatus.Pending or OrderStatus.Accepted, OrderStatus.CancelledByPharmacy) => true,
                _ => false
            };
        }
    }
}
