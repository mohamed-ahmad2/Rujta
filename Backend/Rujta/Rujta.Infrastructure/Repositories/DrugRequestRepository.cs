using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Domain.Enums;
using Rujta.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class DrugRequestRepository : GenericRepository<DrugRequest, int>, IDrugRequestRepository
    {
        private readonly AppDbContext _db;

        public DrugRequestRepository(AppDbContext db) : base(db)
        {
            _db = db;
        }

        public async Task<IEnumerable<DrugRequest>> GetByPharmacyIdAsync(int pharmacyId, CancellationToken ct = default)
            => await _db.DrugRequests
                        .Where(r => r.PharmacyId == pharmacyId)
                        .OrderByDescending(r => r.CreatedAt)
                        .ToListAsync(ct);

        public async Task<IEnumerable<DrugRequest>> GetPendingAsync(CancellationToken ct = default)
            => await _db.DrugRequests
                        .Where(r => r.Status == DrugRequestStatus.Pending)
                        .OrderBy(r => r.CreatedAt)
                        .ToListAsync(ct);

        public async Task<IEnumerable<DrugRequest>> GetAllWithFilterAsync(
            DrugRequestStatus? status,
            int? pharmacyId,
            CancellationToken ct = default)
        {
            var query = _db.DrugRequests.AsQueryable();

            if (status.HasValue)
                query = query.Where(r => r.Status == status.Value);

            if (pharmacyId.HasValue)
                query = query.Where(r => r.PharmacyId == pharmacyId.Value);

            return await query
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync(ct);
        }
    }
}
