// INotificationService.cs
using Rujta.Application.DTOs;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

public interface INotificationService
{
    Task SendNotificationAsync(string userId, string title, string message, string? payload = null);
    Task MarkAsReadAsync(int notificationId);
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId);
}

