// INotificationService.cs
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface INotificationService
{
    Task SendNotificationAsync(Person recipient, string title, string message, string? payload = null);
    Task MarkAsReadAsync(int notificationId);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
}
