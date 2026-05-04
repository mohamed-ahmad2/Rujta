using Microsoft.Extensions.DependencyInjection;
using Rujta.Application.Notifications;

namespace Rujta.Infrastructure.Services
{
    public class NotificationService : INotificationService, IAsyncDisposable, IDisposable
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly INotificationPublisher _publisher;
        private readonly ILogger<NotificationService> _logger;

        private readonly ConcurrentQueue<QueuedNotification> _notificationQueue = new();
        private readonly ConcurrentQueue<QueuedNotification> _pharmacyQueue = new();

        private readonly SemaphoreSlim _queueSemaphore = new(1, 1);
        private readonly CancellationTokenSource _cts = new();
        private readonly Task _backgroundTask;

        private const int MaxRetryPerAttempt = 5;
        private const int MaxTotalRequeues = 3;
        private const int LoopDelayMs = 2000;
        private const int BaseRetryDelayMs = 200;

        private bool _disposed;

        public NotificationService(
            IServiceScopeFactory scopeFactory,
            INotificationPublisher publisher,
            ILogger<NotificationService> logger)
        {
            _scopeFactory = scopeFactory;
            _publisher = publisher;
            _logger = logger;

            _backgroundTask = Task.Run(() => ProcessQueueLoopAsync(_cts.Token));
        }

        public Task SendNotificationAsync(
            string userId,
            string title,
            string message,
            string? payload = null)
            => EnqueueNotificationAsync(userId, title, message, payload, _notificationQueue, "User");

        public Task SendNotificationToPharmacyAsync(
            string pharmacyId,
            string title,
            string message,
            string? payload = null)
            => EnqueueNotificationAsync(pharmacyId, title, message, payload, _pharmacyQueue, "Pharmacy");

        private async Task EnqueueNotificationAsync(
            string targetId,
            string title,
            string message,
            string? payload,
            ConcurrentQueue<QueuedNotification> queue,
            string targetType)
        {
            if (string.IsNullOrWhiteSpace(targetId))
            {
                _logger.LogWarning("Attempted to enqueue notification with empty {TargetType} id", targetType);
                return;
            }

            try
            {
                using var scope = _scopeFactory.CreateScope();
                var repo = scope.ServiceProvider.GetRequiredService<INotificationRepository>();

                var notification = new Notification
                {
                    UserId = targetId,
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

                queue.Enqueue(new QueuedNotification(targetId, dto, 0));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to queue notification for {TargetType} {TargetId}",
                    targetType, targetId);
            }
        }

        private async Task ProcessQueueLoopAsync(CancellationToken token)
        {
            while (!token.IsCancellationRequested)
            {
                try
                {
                    await ProcessQueueAsync(token);
                }
                catch (OperationCanceledException) when (token.IsCancellationRequested)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing notification queue");
                }

                try
                {
                    await Task.Delay(LoopDelayMs, token);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }

        private async Task ProcessQueueAsync(CancellationToken token)
        {
            if (!await _queueSemaphore.WaitAsync(0, token).ConfigureAwait(false))
                return;

            try
            {
                await DrainQueueAsync(
                    _notificationQueue,
                    (id, dto) => _publisher.PublishAsync(id, dto),
                    "User",
                    token);

                await DrainQueueAsync(
                    _pharmacyQueue,
                    (id, dto) => _publisher.PublishToPharmacyAsync(id, dto),
                    "Pharmacy",
                    token);
            }
            finally
            {
                _queueSemaphore.Release();
            }
        }

        private async Task DrainQueueAsync(
            ConcurrentQueue<QueuedNotification> queue,
            Func<string, NotificationDto, Task> publishFunc,
            string targetType,
            CancellationToken token)
        {
            while (!token.IsCancellationRequested && queue.TryDequeue(out var item))
            {
                bool sent = await TryPublishWithRetryAsync(item, publishFunc, targetType, token);

                if (!sent && !token.IsCancellationRequested)
                {
                    HandleFailedDelivery(queue, item, targetType);
                }
            }
        }

        private async Task<bool> TryPublishWithRetryAsync(
            QueuedNotification item,
            Func<string, NotificationDto, Task> publishFunc,
            string targetType,
            CancellationToken token)
        {
            for (int retries = 0; retries < MaxRetryPerAttempt; retries++)
            {
                if (token.IsCancellationRequested) return false;

                try
                {
                    await publishFunc(item.TargetId, item.Dto).ConfigureAwait(false);

                    _logger.LogInformation(
                        "Notification {NotificationId} sent to {TargetType} {TargetId}",
                        item.Dto.Id, targetType, item.TargetId);

                    return true;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex,
                        "Publish attempt {Attempt}/{Max} failed for Notification {Id} → {TargetType} {TargetId}",
                        retries + 1, MaxRetryPerAttempt, item.Dto.Id, targetType, item.TargetId);

                    try
                    {
                        await Task.Delay(BaseRetryDelayMs * (retries + 1), token).ConfigureAwait(false);
                    }
                    catch (OperationCanceledException)
                    {
                        return false;
                    }
                }
            }

            return false;
        }

        private void HandleFailedDelivery(
            ConcurrentQueue<QueuedNotification> queue,
            QueuedNotification item,
            string targetType)
        {
            if (item.Attempts < MaxTotalRequeues)
            {
                int next = item.Attempts + 1;
                _logger.LogWarning(
                    "{TargetType} Notification {Id} re-queued (attempt {Attempt}/{Max})",
                    targetType, item.Dto.Id, next, MaxTotalRequeues);

                queue.Enqueue(item with { Attempts = next });
            }
            else
            {
                _logger.LogError(
                    "{TargetType} Notification {Id} permanently dropped after all retries",
                    targetType, item.Dto.Id);
            }
        }

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

        public async Task StopAsync()
        {
            if (!_cts.IsCancellationRequested)
                await _cts.CancelAsync().ConfigureAwait(false);
        }

 
        public async ValueTask DisposeAsync()
        {
            await DisposeAsyncCore().ConfigureAwait(false);

            Dispose(disposing: false);
            GC.SuppressFinalize(this);
        }

        protected virtual async ValueTask DisposeAsyncCore()
        {
            if (_disposed) return;

            try
            {
                if (!_cts.IsCancellationRequested)
                    await _cts.CancelAsync().ConfigureAwait(false);

                await _backgroundTask.ConfigureAwait(false);
            }
            catch (OperationCanceledException ex)  
            {
                _logger.LogDebug(ex, "NotificationService background task cancelled gracefully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during NotificationService async disposal");
            }
        }

        public void Dispose()
        {
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (_disposed) return;

            if (disposing)
            {
                try
                {
                    if (!_cts.IsCancellationRequested)
                        _cts.Cancel();

                    _backgroundTask.GetAwaiter().GetResult();
                }
                catch (OperationCanceledException ex)   
                {
                    _logger.LogDebug(ex, "NotificationService background task cancelled gracefully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during NotificationService disposal");
                }
                finally
                {
                    _cts.Dispose();
                    _queueSemaphore.Dispose();
                }
            }

            _disposed = true;
        }

        private sealed record QueuedNotification(string TargetId, NotificationDto Dto, int Attempts);
    }
}