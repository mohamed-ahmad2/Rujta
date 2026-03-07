namespace Rujta.Application.Interfaces.InterfaceServices.IOrder
{
    public interface IOrderNotificationService
    {
        Task NotifyStatusChangedAsync(Guid userId, int orderId, OrderStatus orderStatus);
    }
}
