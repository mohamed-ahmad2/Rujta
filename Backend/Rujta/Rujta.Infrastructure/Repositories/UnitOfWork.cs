using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Infrastructure.Data;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private bool _disposed = false;

        // Repositories
        private IMedicineRepository? _medicines;
        private IPharmacyRepository? _pharmacies;
        private IOrderRepository? _orders;
        private INotificationRepository? _notifications;
        private IInventoryRepository? _inventoryItems;
        private ILogRepository? _logs;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        // Repository properties
        public IMedicineRepository Medicines => _medicines ??= new MedicineRepository(_context);
        public IPharmacyRepository Pharmacies => _pharmacies ??= new PharmacyRepo(_context);
        public IOrderRepository Orders => _orders ??= new OrderRepository(_context);
        public INotificationRepository Notifications => _notifications ??= new NotificationRepository(_context);
        public IInventoryRepository InventoryItems => _inventoryItems ??= new InventoryRepository(_context);
        public ILogRepository Logs => _logs ??= new LogRepository(_context);

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
