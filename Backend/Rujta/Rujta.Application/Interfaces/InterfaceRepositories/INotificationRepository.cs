using Rujta.Domain.Entities;

namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface INotificationRepository
    {
        Task AddNotificationAsync(Notification notification);

        Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);

        Task MarkAsReadAsync(int notificationId, string userId);

        Task<int> GetUnreadCountAsync(string userId);
    }
}
