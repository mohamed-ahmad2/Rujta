using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;
        private bool _disposed = false;


        private IMedicineRepository? _medicines;
        private IPharmacyRepository? _pharmacies;
        private IOrderRepository? _orders;

        public UnitOfWork(AppDbContext context)
        {
            _context = context;
        }

        public IMedicineRepository Medicines => _medicines ??= new MedicineRepository(_context);
        public IPharmacyRepository Pharmacies => _pharmacies ??= new PharmacyRepo(_context);
        public IOrderRepository Orders => _orders ??= new OrderRepository(_context);

        public async Task<int> SaveAsync(CancellationToken cancellationToken = default) => await _context.SaveChangesAsync(cancellationToken);
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
