using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IMedicineRepository Medicines { get; }
        IPharmacyRepository Pharmacies { get; }
        IOrderRepository Orders { get; }
        IUserRepository Users { get; }
        IPeopleRepository People { get; }
        IDeviceRepository Devices { get; }
        IRefreshTokenRepository RefreshTokens { get; }
        INotificationRepository Notifications { get; }

        Task<int> SaveAsync(CancellationToken cancellationToken = default);
    }
}
