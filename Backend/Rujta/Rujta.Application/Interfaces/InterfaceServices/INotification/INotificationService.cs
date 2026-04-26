// INotificationService.cs
using Rujta.Application.DTOs;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface INotificationService
    {
        Task SendNotificationAsync(
            string userId,
            string title,
            string message,
            string? payload = null);

        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);

        Task MarkAsReadAsync(int notificationId, string userId);

        Task<int> GetUnreadCountAsync(string userId);

        Task SendNotificationToPharmacyAsync(string pharmacyId, string title, string message, string? payload = null);




    }
}