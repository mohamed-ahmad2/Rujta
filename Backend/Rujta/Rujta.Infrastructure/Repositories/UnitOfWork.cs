namespace Rujta.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private readonly IServiceProvider _serviceProvider;
        private bool _disposed = false;

        // Repositories
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
        private IStaffRepository? _staffs;
        private ICategoryRepository? _category;


        public UnitOfWork(AppDbContext context, IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
        }

        // Repository properties
        public IMedicineRepository Medicines => _medicines ??= new MedicineRepository(_context);
        public IPharmacyRepository Pharmacies => _pharmacies ??= new PharmacyRepo(_context);
        public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
        public IAddressRepository Address => _address ??= new AddressRepository(_context);
        public ICategoryRepository Categories => _category ??= new CategoryRepository(_context);
        public IPeopleRepository People => _people ??= new PeopleRepository(_context);
        public IDeviceRepository Devices => _device ??= new DeviceRepository(_context);
        public IRefreshTokenRepository RefreshTokens => _refreshTokens ??= new RefreshTokenRepository(_context);
        public IUserRepository Users => _users ??= ActivatorUtilities.CreateInstance<UserRepository>(_serviceProvider);
        public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);
        public IInventoryRepository InventoryItems => _inventoryItems ??= new InventoryRepository(_context);
        public ILogRepository Logs => _logs ??= new LogRepository(_context);

        public IStaffRepository Staffs => _staffs ??= new StaffRepository(_context);

        // Save changes
        public async Task<int> SaveAsync(CancellationToken cancellationToken = default)
            => await _context.SaveChangesAsync(cancellationToken);

        // Dispose
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
