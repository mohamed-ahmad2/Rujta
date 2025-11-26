using FluentValidation;
using FluentValidation.AspNetCore;
using Rujta.Application.Validation;


namespace Rujta.Infrastructure.Extensions
{
    public static class FluentValidationConfiguration
    {
        public static IServiceCollection AddCustomFluentValidation(this IServiceCollection services)
        {
            services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();
            services.AddFluentValidationAutoValidation();
            services.AddFluentValidationClientsideAdapters();
            return services;
        }
    }
}
