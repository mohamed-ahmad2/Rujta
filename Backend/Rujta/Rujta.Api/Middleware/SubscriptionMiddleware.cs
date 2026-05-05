using System.Security.Claims;
using Rujta.Application.Interfaces;

namespace Rujta.API.Middleware
{
    public class SubscriptionMiddleware
    {
        private readonly RequestDelegate _next;

        // Routes a PharmacyAdmin is ALWAYS allowed through regardless of status
        private static readonly HashSet<string> _alwaysAllowed = new(StringComparer.OrdinalIgnoreCase)
        {
            "/api/subscription/create",
            "/api/subscription/renew",
            "/api/subscription/status",
            "/api/auth/login",
            "/api/auth/logout",
            "/api/auth/refresh-token",
        };

        public SubscriptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUnitOfWork uow)
        {
            // Only apply to authenticated PharmacyAdmin users
            if (!context.User.Identity?.IsAuthenticated ?? true)
            {
                await _next(context);
                return;
            }

            var isPharmacyAdmin = context.User.IsInRole("PharmacyAdmin");
            if (!isPharmacyAdmin)
            {
                await _next(context);
                return;
            }

            // Always allow whitelisted routes
            var path = context.Request.Path.Value ?? string.Empty;
            if (_alwaysAllowed.Any(r => path.StartsWith(r, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            // Extract user ID from JWT claims
            var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim is null || !Guid.TryParse(userIdClaim, out var userId))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Invalid token. Could not identify user."
                });
                return;
            }

            // Get pharmacy linked to this admin
            var pharmacy = await uow.Pharmacies.GetByAdminIdAsync(userId);
            if (pharmacy is null)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "No pharmacy is linked to your account."
                });
                return;
            }

            // Get subscription
            var subscription = await uow.Subscriptions.GetByPharmacyIdAsync(pharmacy.Id);

            // Case 1: No subscription at all → force them to /create
            if (subscription is null)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "You must complete your subscription setup before accessing the system.",
                    redirectTo = "/api/subscription/create",
                    subscriptionStatus = "Pending"
                });
                return;
            }

            // Case 2: Auto-expire if EndDate passed
            if (subscription.Status == Domain.Enums.SubscriptionStatus.Active
                && subscription.EndDate < DateTime.UtcNow)
            {
                subscription.Status = Domain.Enums.SubscriptionStatus.Expired;
                pharmacy.IsActive = false;
                await uow.SaveAsync();
            }

            // Case 3: Expired → force them to /renew
            if (subscription.Status == Domain.Enums.SubscriptionStatus.Expired)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Your subscription has expired. Please renew to continue.",
                    redirectTo = "/api/subscription/renew",
                    subscriptionStatus = "Expired",
                    expiredOn = subscription.EndDate
                });
                return;
            }

            // Case 4: Pending (created account but never subscribed)
            if (subscription.Status == Domain.Enums.SubscriptionStatus.Pending)
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "Please complete your subscription to access the system.",
                    redirectTo = "/api/subscription/create",
                    subscriptionStatus = "Pending"
                });
                return;
            }

            // All good — Active subscription
            await _next(context);
        }
    }
}