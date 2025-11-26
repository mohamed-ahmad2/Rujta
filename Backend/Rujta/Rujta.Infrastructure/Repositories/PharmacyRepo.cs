namespace Rujta.Infrastructure.Repositories
{
    public class PharmacyRepo : GenericRepository<Pharmacy>, IPharmacyRepository
    {
        

        public PharmacyRepo(AppDbContext context) : base(context) { }
        

        public async Task<IEnumerable<Pharmacy>> GetAllPharmacies(CancellationToken cancellationToken = default) =>
             await _context.Pharmacies.ToListAsync(cancellationToken);
        public async Task<int> GetMedicineStockAsync(int pharmacyId, int medicineId)
        {
            return await _context.InventoryItems
                .Where(i => i.PharmacyID == pharmacyId && i.MedicineID == medicineId)
                .Select(i => i.Quantity)
                .FirstOrDefaultAsync();
        }




    }
}
