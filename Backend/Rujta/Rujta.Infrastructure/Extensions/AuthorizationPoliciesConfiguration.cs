using Microsoft.Extensions.DependencyInjection;
using Rujta.Infrastructure.Identity.Requirements;


namespace Rujta.Infrastructure.Extensions
{
    public static class AuthorizationPoliciesConfiguration
    {
        public static IServiceCollection AddCustomAuthorizationPolicies(this IServiceCollection services)
        {
            services.AddAuthorization(options =>
            {
                options.AddPolicy("IsPharmacyAdmin", policy =>
                    policy.RequireRole("PharmacyAdmin", "SuperAdmin"));

                options.AddPolicy("IsPharmacist", policy =>
                    policy.RequireRole("Pharmacist", "PharmacyAdmin", "SuperAdmin"));

                options.AddPolicy("SamePharmacy", policy =>
                    policy.Requirements.Add(new SamePharmacyRequirement()));
            });

            return services;
        }
    }
}
