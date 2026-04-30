using Microsoft.EntityFrameworkCore.Storage;

namespace Rujta.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork, IAsyncDisposable
    {
        private readonly AppDbContext _context;
        private readonly IServiceProvider _serviceProvider;
        private bool _disposed = false;

        private IMedicineRepository? _medicines;
        private IPharmacyRepository? _pharmacies;
        private IOrderRepository? _orders;
        private IUserRepository? _users;
        private IPeopleRepository? _people;
        private IAddressRepository? _address;
        private IDeviceRepository? _device;
        private IRefreshTokenRepository? _refreshTokens;
        private INotificationRepository? _notifications;
        private IInventoryRepository? _inventoryItems;
        private ILogRepository? _logs;
        private IPharmacistRepository? _pharmacists;
        private ICategoryRepository? _category;
        private ICustomerRepository? _customers;
        private ISuperAdminRepository? _superAdminReposatory;
        private ISubscriptionRepository? _subscriptions;
        private IAdRepository? _ads;
        private IDiscountRepository? _discount;

        public UnitOfWork(AppDbContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        public IMedicineRepository Medicines =>
            _medicines ??= _serviceProvider.GetRequiredService<IMedicineRepository>();

        public IPharmacyRepository Pharmacies =>
            _pharmacies ??= _serviceProvider.GetRequiredService<IPharmacyRepository>();

        public IOrderRepository Orders =>
            _orders ??= _serviceProvider.GetRequiredService<IOrderRepository>();

        public IAddressRepository Address =>
            _address ??= _serviceProvider.GetRequiredService<IAddressRepository>();

        public ICategoryRepository Categories =>
            _category ??= _serviceProvider.GetRequiredService<ICategoryRepository>();

        public IPeopleRepository People =>
            _people ??= _serviceProvider.GetRequiredService<IPeopleRepository>();

        public IDeviceRepository Devices =>
            _device ??= _serviceProvider.GetRequiredService<IDeviceRepository>();

        public IRefreshTokenRepository RefreshTokens =>
            _refreshTokens ??= _serviceProvider.GetRequiredService<IRefreshTokenRepository>();

        public IUserRepository Users =>
            _users ??= _serviceProvider.GetRequiredService<IUserRepository>();

        public INotificationRepository Notifications =>
            _notifications ??= _serviceProvider.GetRequiredService<INotificationRepository>();

        public IInventoryRepository InventoryItems =>
            _inventoryItems ??= _serviceProvider.GetRequiredService<IInventoryRepository>();

        public IDiscountRepository Discount =>
            _discount ??= _serviceProvider.GetRequiredService<IDiscountRepository>();

        public ILogRepository Logs =>
            _logs ??= _serviceProvider.GetRequiredService<ILogRepository>();

        public IPharmacistRepository Pharmacists =>
            _pharmacists ??= _serviceProvider.GetRequiredService<IPharmacistRepository>();

        public ICustomerRepository Customers =>
            _customers ??= _serviceProvider.GetRequiredService<ICustomerRepository>();

        public ISuperAdminRepository SuperAdmin =>
            _superAdminReposatory ??= _serviceProvider.GetRequiredService<ISuperAdminRepository>();

        public ISubscriptionRepository Subscriptions =>
            _subscriptions ??= _serviceProvider.GetRequiredService<ISubscriptionRepository>();

        public IAdRepository Ads =>
            _ads ??= _serviceProvider.GetRequiredService<IAdRepository>();

        public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);

        public async Task<IDbContextTransaction> BeginTransactionAsync(
            CancellationToken cancellationToken = default)
            => await _context.Database.BeginTransactionAsync(cancellationToken);
    
        public async Task CommitTransactionAsync(IDbContextTransaction transaction)
            => await transaction.CommitAsync();

        public async Task RollbackTransactionAsync(IDbContextTransaction transaction)
            => await transaction.RollbackAsync();

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                    _context.Dispose();
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        public async ValueTask DisposeAsync()
        {
            if (!_disposed)
            {
                await _context.DisposeAsync();
                _disposed = true;
            }
            GC.SuppressFinalize(this);
        }
    }
}