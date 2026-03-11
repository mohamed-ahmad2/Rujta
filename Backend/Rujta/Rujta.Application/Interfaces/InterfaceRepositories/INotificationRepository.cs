using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface INotificationRepository
    {
        Task AddNotificationAsync(Notification notification);
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
        Task<Notification?> GetByIdAsync(int id);               // لازم نجيب Notification حسب Id
        Task MarkAsReadAsync(int notificationId, string userId);
        Task<int> GetUnreadCountAsync(string userId);
    }
}