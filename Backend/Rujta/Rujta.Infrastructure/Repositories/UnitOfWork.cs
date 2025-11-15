using Microsoft.Extensions.DependencyInjection;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly IServiceProvider _serviceProvider;
        private bool _disposed = false;

        private IMedicineRepository? _medicines;
        private IPharmacyRepository? _pharmacies;
        private IOrderRepository? _orders;
        private IUserRepository? _users;
        private IPeopleRepository? _people;
        private IDeviceRepository? _device;
        private IRefreshTokenRepository? _refreshTokens;
        private INotificationRepository? _notifications;

        public UnitOfWork(AppDbContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        public IMedicineRepository Medicines => _medicines ??= new MedicineRepository(_context);
        public IPharmacyRepository Pharmacies => _pharmacies ??= new PharmacyRepo(_context);
        public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
        public IPeopleRepository People => _people ??= new PeopleRepository(_context);
        public IDeviceRepository Devices => _device ??= new DeviceRepository(_context);
        public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
        public IUserRepository Users => _users ??= ActivatorUtilities.CreateInstance<UserRepository>(_serviceProvider);
        public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);

        public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    _context.Dispose();
                }
                _disposed = true;
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }
    }
}
