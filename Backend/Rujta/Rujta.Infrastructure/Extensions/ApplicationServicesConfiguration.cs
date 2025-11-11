using Microsoft.Extensions.DependencyInjection;
using Rujta.Application.Services;
using Rujta.Infrastructure.Identity.Services;
using Rujta.Infrastructure.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Extensions
{
    public static class ApplicationServicesConfiguration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            // Mapper
            services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

            // Scoped services
            services.AddScoped<TokenService>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            services.AddScoped<IMedicineService, MedicineService>();
            services.AddScoped<IOrderService, OrderService>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IPharmacyRepository, PharmacyRepo>();
            services.AddScoped<PharmacyDistanceService>();

            // HttpClient services
            services.AddHttpClient<MedicineDataImportService>();

            return services;
        }
    }
}
