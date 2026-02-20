namespace Rujta.Application.Interfaces.InterfaceServices.IOrder
{
    public interface IOrderNotificationService
    {
        Task NotifyStatusChangedAsync(int pharmacyId, int orderId, OrderStatus orderStatus);
    }
}
