using Microsoft.AspNetCore.Builder;
using Rujta.Domain.Hubs;

namespace Rujta.Infrastructure.Extensions
{
    public static class SignalRExtensions
    {
        public static WebApplication MapSignalRHubs(this WebApplication app)
        {
            app.MapHub<NotificationHub>("/notificationHub");
            return app;
        }
    }
}
