using Microsoft.AspNetCore.Authorization;
using Rujta.Infrastructure.Identity.Requirements;

namespace Rujta.Infrastructure.Identity.Handlers
{
    public class SamePharmacyHandler : AuthorizationHandler<SamePharmacyRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            SamePharmacyRequirement requirement)
        {
            var userPharmacyId = context.User.FindFirst("PharmacyId")?.Value;
            var targetPharmacyId = context.Resource?.ToString();

            if (userPharmacyId != null && userPharmacyId == targetPharmacyId)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
