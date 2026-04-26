using Microsoft.Extensions.DependencyInjection;
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
    public class NotificationService : INotificationService, IDisposable
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly INotificationPublisher _publisher;
        private readonly ILogger<NotificationService> _logger;

        // existing user queue
        private readonly ConcurrentQueue<(string userId, NotificationDto dto, int attempts)> _notificationQueue = new();

        // ✅ NEW — pharmacy queue
        private readonly ConcurrentQueue<(string pharmacyId, NotificationDto dto, int attempts)> _pharmacyQueue = new();

        private readonly SemaphoreSlim _queueSemaphore = new(1, 1);

        private const int MaxRetryPerAttempt = 5;
        private const int MaxTotalRequeues = 3;

        private readonly CancellationTokenSource _cts = new();

        public NotificationService(
            IServiceScopeFactory scopeFactory,
            INotificationPublisher publisher,
            ILogger<NotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _publisher = publisher;
            _logger = logger;

            _ = ProcessQueueLoopAsync(_cts.Token);
        }

        // ─── existing — send to user ───────────────────────────────────────────
        public async Task SendNotificationAsync(
            string userId,
            string title,
            string message,
            string? payload = null)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

                var notification = new Notification
                {
                    UserId = userId,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await repo.AddNotificationAsync(notification);

                var dto = new NotificationDto
                {
                    Id = notification.Id,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = notification.CreatedAt,
                    IsRead = false
                };

                _notificationQueue.Enqueue((userId, dto, 0));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to queue notification for User {UserId}", userId);
            }
        }

        // ✅ NEW — send to pharmacy group
        public async Task SendNotificationToPharmacyAsync(
            string pharmacyId,
            string title,
            string message,
            string? payload = null)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

                var notification = new Notification
                {
                    UserId = pharmacyId, // stored with pharmacyId as userId
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false
                };

                await repo.AddNotificationAsync(notification);

                var dto = new NotificationDto
                {
                    Id = notification.Id,
                    Title = title,
                    Message = message,
                    Payload = payload,
                    CreatedAt = notification.CreatedAt,
                    IsRead = false
                };

                _pharmacyQueue.Enqueue((pharmacyId, dto, 0));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to queue pharmacy notification for Pharmacy {PharmacyId}", pharmacyId);
            }
        }

        // ─── queue loop ────────────────────────────────────────────────────────
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
                // ─── existing user queue ───────────────────────────────────────
                while (_notificationQueue.TryDequeue(out var item))
                {
                    int retries = 0;
                    bool sent = false;

                    while (!sent && retries < MaxRetryPerAttempt)
                    {
                        try
                        {
                            await _publisher.PublishAsync(item.userId, item.dto);
                            sent = true;
                            _logger.LogInformation(
                                "Notification {NotificationId} sent to User {UserId}",
                                item.dto.Id, item.userId);
                        }
                        catch
                        {
                            retries++;
                            await Task.Delay(200 * retries);
                        }
                    }

                    if (!sent)
                    {
                        if (item.attempts < MaxTotalRequeues)
                        {
                            int next = item.attempts + 1;
                            _logger.LogWarning(
                                "Notification {Id} re-queued (attempt {Attempt}/{Max})",
                                item.dto.Id, next, MaxTotalRequeues);
                            _notificationQueue.Enqueue((item.userId, item.dto, next));
                        }
                        else
                        {
                            _logger.LogError(
                                "Notification {Id} permanently dropped after all retries",
                                item.dto.Id);
                        }
                    }
                }

                // ✅ NEW — pharmacy queue ───────────────────────────────────────
                while (_pharmacyQueue.TryDequeue(out var item))
                {
                    int retries = 0;
                    bool sent = false;

                    while (!sent && retries < MaxRetryPerAttempt)
                    {
                        try
                        {
                            await _publisher.PublishToPharmacyAsync(item.pharmacyId, item.dto);
                            sent = true;
                            _logger.LogInformation(
                                "Notification {NotificationId} sent to Pharmacy {PharmacyId}",
                                item.dto.Id, item.pharmacyId);
                        }
                        catch
                        {
                            retries++;
                            await Task.Delay(200 * retries);
                        }
                    }

                    if (!sent)
                    {
                        if (item.attempts < MaxTotalRequeues)
                        {
                            int next = item.attempts + 1;
                            _logger.LogWarning(
                                "Pharmacy Notification {Id} re-queued (attempt {Attempt}/{Max})",
                                item.dto.Id, next, MaxTotalRequeues);
                            _pharmacyQueue.Enqueue((item.pharmacyId, item.dto, next));
                        }
                        else
                        {
                            _logger.LogError(
                                "Pharmacy Notification {Id} permanently dropped after all retries",
                                item.dto.Id);
                        }
                    }
                }
            }
            finally
            {
                _queueSemaphore.Release();
            }
        }

        // ─── existing read methods — no change ────────────────────────────────
        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(string userId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

            var notifications = await repo.GetUserNotificationsAsync(userId);
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
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            await repo.MarkAsReadAsync(notificationId, userId);
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            using var scope = _scopeFactory.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();
            return await repo.GetUnreadCountAsync(userId);
        }

        public void Stop() => _cts.Cancel();

        public void Dispose()
        {
            _cts.Cancel();
            _cts.Dispose();
            _queueSemaphore.Dispose();
        }
    }
}