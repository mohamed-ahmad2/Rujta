using Rujta.Application.DTOs.OrderDto;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
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

                await _notificationService.NotifyOrderUpdatedAsync(order.PharmacyId, order.Id);

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
    }
}