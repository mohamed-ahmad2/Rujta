using Microsoft.EntityFrameworkCore;

namespace Rujta.Application.Services.OrderS
{
    public partial class OrderService
    {
        public async Task<(bool success, string message)> MarkAsDeliveredAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Marking Order {OrderId} as Delivered", id);

            Order? deliveredOrder = null;

            try
            {
                var result = await _unitOfWork.ExecuteInTransactionAsync<(bool success, string message)>(
                    async ct =>
                    {
                        var order = await _unitOfWork.Orders.GetOrderWithItemsAsync(id, ct);

                        if (order == null)
                            return (false, OrderMessages.OrderNotFound);

                        if (order.PharmacyId != pharmacyId)
                            return (false, "Unauthorized pharmacy access");

                        if (!CanChangeStatus(order.Status, OrderStatus.Delivered))
                            return (false, OrderMessages.InvalidStateTransition);

                        var stockResult = await DeductInventoryAsync(order, ct);
                        if (!stockResult.success)
                            return stockResult;

                        order.Status = OrderStatus.Delivered;

                        await _unitOfWork.SaveAsync(ct);

                        deliveredOrder = order;

                        return (true, OrderMessages.OrderMarkAsDelivered);
                    },
                    cancellationToken);


                if (result.success && deliveredOrder != null)
                {
                    await SafeNotifyDeliveredAsync(deliveredOrder);
                }

                return result;
            }
            catch (DbUpdateConcurrencyException)
            {
                _logger.LogWarning("Concurrency conflict when delivering Order {OrderId}", id);
                return (false, "Order was modified by another user. Please refresh and try again.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error delivering Order {OrderId}", id);
                return (false, "An unexpected error occurred");
            }
        }

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