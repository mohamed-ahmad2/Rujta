namespace Rujta.Application.Interfaces.InterfaceServices.IOrder
{
    public interface IOrderNotificationService
    {
        Task NotifyNewOrderAsync(int pharmacyId, int orderId);

        Task NotifyOrderUpdatedAsync(int pharmacyId, int orderId);

        Task NotifyStatusChangedAsync(
            int pharmacyId,
            string userId,
            int orderId,
            OrderStatus status);

        Task NotifyOrderItemChangedAsync(int orderId);
    }
}
