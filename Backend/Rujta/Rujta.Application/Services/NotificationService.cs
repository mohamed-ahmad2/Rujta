using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Application.Notifications;
using Rujta.Domain.Entities;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Services
{
    public class NotificationService : INotificationService
    {
        private readonly INotificationRepository _repo;
        private readonly INotificationPublisher _publisher;
        private readonly ILogger<NotificationService> _logger;

        private readonly ConcurrentQueue<(string userId, NotificationDto dto)> _notificationQueue = new();
        private readonly SemaphoreSlim _queueSemaphore = new(1, 1);

        private readonly CancellationTokenSource _cts = new();

        public NotificationService(
            INotificationRepository repo,
            INotificationPublisher publisher,
            ILogger<NotificationService> logger)
        {
            _repo = repo;
            _publisher = publisher;
            _logger = logger;

            _ = ProcessQueueLoopAsync(_cts.Token);
        }

        public async Task SendNotificationAsync(
            string userId,
            string title,
            string message,
            string? payload = null)
        {
            try
            {
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

                var dto = new NotificationDto
                {
                    Id = notification.Id,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = notification.CreatedAt,
                    IsRead = false
                };

                _notificationQueue.Enqueue((userId, dto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to queue notification for User {UserId}", userId);
            }
        }

        private async Task ProcessQueueLoopAsync(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                try
                {
                    await ProcessQueueAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing notification queue");
                }

                await Task.Delay(2000, token);
            }
        }

        private async Task ProcessQueueAsync()
        {
            if (!_queueSemaphore.Wait(0)) return;

            try
            {
                while (_notificationQueue.TryDequeue(out var item))
                {
                    int retries = 0;
                    bool sent = false;

                    while (!sent && retries < 5)
                    {
                        try
                        {
                            await _publisher.PublishAsync(item.userId, item.dto);

                            sent = true;

                            _logger.LogInformation(
                                "Notification {NotificationId} sent to User {UserId}",
                                item.dto.Id,
                                item.userId);
                        }
                        catch
                        {
                            retries++;
                            await Task.Delay(200 * retries);
                        }
                    }

                    if (!sent)
                    {
                        _logger.LogWarning(
                            "Notification {NotificationId} could not be sent to User {UserId}, retrying later",
                            item.dto.Id,
                            item.userId);

                        _notificationQueue.Enqueue(item);
                    }
                }
            }
            finally
            {
                _queueSemaphore.Release();
            }
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            var notifications = await _repo.GetUserNotificationsAsync(userId);

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                Title = n.Title,
                Message = n.Message,
                Payload = n.Payload,
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            });
        }

        public async Task MarkAsReadAsync(int notificationId, string userId)
        {
            await _repo.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _repo.GetUnreadCountAsync(userId);
        }

        public void Stop()
        {
            _cts.Cancel();
        }
    }
}