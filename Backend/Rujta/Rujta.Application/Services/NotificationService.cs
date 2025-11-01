using Microsoft.AspNetCore.SignalR;
using Rujta.Application.Interfaces;
using Rujta.Domain.Common;
using Rujta.Domain.Entities;
using Rujta.Domain.Hubs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationService(INotificationRepository repo, IHubContext<NotificationHub> hubContext)
        {
            _repo = repo;
            _hubContext = hubContext;
        }

        public async Task SendNotificationAsync(Person recipient, string title, string message, string? payload = null)
        {
            string userId = recipient switch
            {
                User u => u.Id.ToString(),
                Admin a => a.Id.ToString(),
                Pharmacist p when p.ManagerData != null => p.Id.ToString(),
                Pharmacist p => p.Id.ToString(),
                _ => throw new ArgumentException("Unknown recipient type")
            };

            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Payload = payload,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _repo.AddNotificationAsync(notification);
            await _hubContext.Clients.User(userId)
                .SendAsync("ReceiveNotification", title, message, payload);
        }



        public Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
        {
            return _repo.GetUserNotificationsAsync(userId);
        }

        public Task MarkAsReadAsync(int notificationId)
        {
            return _repo.MarkAsReadAsync(notificationId);
        }
    }
}
