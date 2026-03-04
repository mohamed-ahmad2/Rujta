namespace Rujta.Infrastructure.Repositories
{
    public class MedicineRepository : GenericRepository<Medicine, int>, IMedicineRepository
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

        public async Task<List<Medicine>> GetByNamesAsync(IEnumerable<string> names,CancellationToken cancellationToken = default)
        {
            if (names == null || !names.Any())
                return new List<Medicine>();

            var normalizedNames = names
                .Select(n => n.Trim().ToLowerInvariant())
                .ToList();

            return await _context.Medicines
                .Where(m => normalizedNames.Contains(m.Name!.ToLower()))
                .ToListAsync(cancellationToken);
        }

    }
}
