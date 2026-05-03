using Microsoft.EntityFrameworkCore.Storage;

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
        ISuperAdminRepository SuperAdmin { get; }
        ISubscriptionRepository Subscriptions { get; }
        IAdRepository Ads { get; }
        IDiscountRepository Discount { get; }
        ICompanyRepository Companies { get; }

        Task<int> SaveAsync(CancellationToken cancellationToken = default);
        IExecutionStrategy CreateExecutionStrategy();
     
        Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action,CancellationToken cancellationToken = default);

        Task<TResult> ExecuteInTransactionAsync<TResult>(Func<CancellationToken, Task<TResult>> action,CancellationToken cancellationToken = default);
    }
}