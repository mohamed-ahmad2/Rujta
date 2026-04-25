using Microsoft.EntityFrameworkCore;
using Rujta.Domain.Entities;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<(bool success, string message)> MarkAsDeliveredAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                _logger.LogInformation("Marking Order {OrderId} as Delivered", id);

                var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id, cancellationToken);

                if (order == null)
                    return (false, OrderMessages.OrderNotFound);

                if (order.PharmacyId != pharmacyId)
                    return (false, "Unauthorized pharmacy access");

                if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                    return (false, OrderMessages.InvalidStateTransition);

                var stockResult = await DeductInventoryAsync(order, cancellationToken);
                if (!stockResult.success)
                    return stockResult;

                order.Status = OrderStatus.Delivered;

                try
                {
                    await _unitOfWork.SaveAsync(cancellationToken);
                    await transaction.CommitAsync(cancellationToken);
                    await SafeNotifyDeliveredAsync(order);

                    return (true, OrderMessages.OrderMarkAsDelivered);
                }
                catch (DbUpdateConcurrencyException)
                {
                    await transaction.RollbackAsync(cancellationToken);
                    _logger.LogWarning("Concurrency conflict when delivering Order {OrderId}", id);
                    return (false, "Order was modified by another user. Please refresh and try again.");
                }
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cancellationToken);
                _logger.LogError(ex, "Error delivering Order {OrderId}", id);
                return (false, "An unexpected error occurred");
            }
        }

        // ── Private Helper ─────────────────────────────────────────────────

        private async Task<(bool success, string message)> DeductInventoryAsync(
            Order order,
            CancellationToken cancellationToken)
        {
            foreach (var item in order.OrderItems)
            {
                var inventoryItem = await _unitOfWork.InventoryItems
                    .GetByMedicineAndPharmacyAsync(item.MedicineID, order.PharmacyId, cancellationToken);

                if (inventoryItem == null)
                    return (false, "Inventory item not found");

                if (inventoryItem.Quantity < item.Quantity)
                    return (false, "Insufficient stock to deliver order");

                inventoryItem.Quantity -= item.Quantity;

                if (inventoryItem.Quantity == 0)
                    inventoryItem.Status = ProductStatus.OutOfStock;

                await _unitOfWork.InventoryItems.UpdateAsync(inventoryItem);
            }

            return (true, string.Empty);
        }
    }
}