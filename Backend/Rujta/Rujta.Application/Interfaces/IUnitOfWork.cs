using Rujta.Application.Interfaces.InterfaceRepositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IMedicineRepository Medicines { get; }
        IPharmacyRepository Pharmacies { get; }
        IOrderRepository Orders { get; }
        INotificationRepository Notifications { get; }
        IInventoryRepository InventoryItems { get; }

        Task<int> SaveAsync(CancellationToken cancellationToken = default);
    }
}
