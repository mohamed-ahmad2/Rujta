using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Rujta.Authorization
{
    public class SamePharmacyHandler : AuthorizationHandler<SamePharmacyRequirement>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            SamePharmacyRequirement requirement)
        {
            var userPharmacyId = context.User.FindFirst("PharmacyId")?.Value;
            var targetPharmacyId = context.Resource?.ToString(); // هتعدلها حسب API

            if (userPharmacyId != null && userPharmacyId == targetPharmacyId)
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
