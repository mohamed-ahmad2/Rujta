using F23.StringSimilarity;
using Microsoft.EntityFrameworkCore;
using Rujta.Application.Interfaces.InterfaceRepositories;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Repositories
{
    public class MedicineRepository : GenericRepository<Medicine>, IMedicineRepository
    {


        public MedicineRepository(AppDbContext context) : base(context) { }

        

        public async Task<IEnumerable<Medicine>> GetExpiredMedicinesAsync( CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Medicines
                .Where(m => m.ExpiryDate < today)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Medicine>> GetExpiringSoonMedicinesAsync(int days = 30, CancellationToken cancellationToken = default)
        {
            var today = DateTime.UtcNow.Date;
            var upcoming = today.AddDays(days);
            return await _context.Medicines
                .Where(m => m.ExpiryDate >= today && m.ExpiryDate <= upcoming)
                .ToListAsync(cancellationToken);
        }
    }
}
