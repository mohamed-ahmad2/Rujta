using System.Threading.Tasks;

namespace Rujta.Application.Notifications
{
    public interface INotificationPublisher
    {
        Task PublishAsync(string userId, NotificationDto dto);
        Task PublishToPharmacyAsync(string pharmacyId, NotificationDto dto); // ✅ ADD THIS

    }
}