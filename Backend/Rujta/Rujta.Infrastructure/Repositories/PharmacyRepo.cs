using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.PharmacyDtos;

namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy, int>, IPharmacyRepository
    {
        public PharmacyRepo(AppDbContext context) : base(context) { }

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .Include(p => p.Address)           
                .Where(p => !p.IsDeleted)            
                .ToListAsync(cancellationToken);

        public async Task<Pharmacy?> GetByIdWithAddressAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            return await _context.Pharmacies
                .Include(p => p.Address)
                .FirstOrDefaultAsync(p => p.Id == pharmacyId && !p.IsDeleted, cancellationToken);
        }

        public async Task<List<PharmacyDto>> GetAllPharmaciesSuperAdminAsync( CancellationToken cancellationToken = default)
        {
            return await _context.Pharmacies
                .AsNoTracking()
                .Where(p => !p.IsDeleted)
                .Select(p => new PharmacyDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    ImageUrl = p.ImageUrl,

                    Address = p.Address == null ? null : new AddressDto
                    {
                        Street = p.Address.Street,
                        City = p.Address.City,
                        Governorate = p.Address.Governorate,
                        Latitude = p.Address.Latitude,
                        Longitude = p.Address.Longitude
                    },

                    ManagerName = p.Manager != null ? p.Manager.Name : null,
                    AdminName = p.Admin != null ? p.Admin.Name : null,

                    BranchesCount = p.Branches.Count(b => !b.IsDeleted)
                })
                .ToListAsync(cancellationToken);
        }

        public async Task<List<Medicine>> GetAllMedicinesByPharmacyAsync(int pharmacyId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId)
                .Include(i => i.Medicine)
                .Where(i => i.Medicine != null)
                .Select(i => i.Medicine!)
                .Distinct()
                .ToListAsync();

        public async Task<List<InventoryItem>> GetInventoryItemsWithMedicineByPharmacyAsync(
            int pharmacyId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.Medicine != null)
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Company)
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Category)
                .ToListAsync();

        public async Task<bool> PharmacyHasMedicineAsync(int pharmacyId, int medicineId)
            => await _context.InventoryItems
                .AnyAsync(i => i.PharmacyID == pharmacyId
                            && i.MedicineID == medicineId);

        public async Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId)
            => await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.MedicineID == medicineId)
                .Select(i => i.Quantity)
                .FirstOrDefaultAsync();

        public async Task<Pharmacy?> GetByAdminIdAsync(Guid adminId)
            => await _context.Pharmacies
                .Include(p => p.Subscription)
                .FirstOrDefaultAsync(p => p.AdminId == adminId);

        public async Task<List<Pharmacy>> GetPharmaciesByIdsAsync(List<int> ids)
            => await _context.Pharmacies
                .Include(p => p.Address)          
                .Where(p => ids.Contains(p.Id))
                .ToListAsync();

        public async Task<List<Pharmacy>> GetBranchesAsync(int parentId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .Where(p => p.ParentPharmacyID == parentId && !p.IsDeleted)
                .Include(p => p.Manager)
                .Include(p => p.Admin)
                .ToListAsync(cancellationToken);

        public async Task<List<Pharmacy>> GetMainPharmaciesAsync(CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .Where(p => p.ParentPharmacyID == null && !p.IsDeleted)
                .Include(p => p.Manager)
                .Include(p => p.Admin)
                .Include(p => p.Branches)
                .ToListAsync(cancellationToken);

        public async Task<int> CountBranchesAsync(int parentId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .CountAsync(p => p.ParentPharmacyID == parentId && !p.IsDeleted, cancellationToken);

        public async Task<bool> IsMainPharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
            => await _context.Pharmacies
                .AnyAsync(p => p.Id == pharmacyId && p.ParentPharmacyID == null, cancellationToken);

        public async Task<(List<InventoryItem> Items, int TotalCount)> GetPagedInventoryByPharmacyAsync(
            int pharmacyId,
            int pageNumber,
            int pageSize,
            string? searchTerm,
            int? categoryId,
            CancellationToken cancellationToken = default)
        {
            
            var baseQuery = _context.InventoryItems
                .AsNoTracking()
                .Where(i => i.PharmacyID == pharmacyId && i.Medicine != null);

           
            if (categoryId.HasValue)
            {
                baseQuery = baseQuery.Where(i =>
                    i.Medicine!.CategoryId == categoryId.Value);
            }

         
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();
                baseQuery = baseQuery.Where(i =>
                    (i.Medicine!.Name != null && EF.Functions.Like(i.Medicine.Name, $"%{term}%")) ||
                    (i.Medicine.ActiveIngredient != null &&
                     EF.Functions.Like(i.Medicine.ActiveIngredient, $"%{term}%")));
            }

           
            var distinctInventoryIdsQuery = baseQuery
                .GroupBy(i => i.MedicineID)
                .Select(g => g
                    .OrderByDescending(x => x.Quantity)
                    .Select(x => x.Id)
                    .First());

       
            var totalCount = await distinctInventoryIdsQuery.CountAsync(cancellationToken);

         
            var pagedIds = await distinctInventoryIdsQuery
                .OrderBy(id => id)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            
            if (pagedIds.Count == 0)
                return (new List<InventoryItem>(), totalCount);

            var items = await _context.InventoryItems
                .AsNoTracking()
                .Where(i => pagedIds.Contains(i.Id))
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Company)
                .Include(i => i.Medicine)
                    .ThenInclude(m => m!.Category)
                .ToListAsync(cancellationToken);

          
            var orderedItems = pagedIds
                .Select(id => items.First(i => i.Id == id))
                .ToList();

            return (orderedItems, totalCount);
        }
    }
}