using Rujta.Application.Interfaces.InterfaceRepositories;

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
        IInventoryRepository InventoryItems { get; }
        ILogRepository Logs { get; }
        IPharmacistRepository Pharmacists { get; }
        IAddressRepository Address { get; }
        ICategoryRepository Categories { get; }
        ICustomerRepository Customers { get; }

        Task<int> SaveAsync(CancellationToken cancellationToken = default);
    }
}
