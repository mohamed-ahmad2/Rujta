namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IOrderNotificationService
    {
        Task NotifyStatusChangedAsync(int pharmacyId, int orderId, OrderStatus orderStatus);
    }
}
