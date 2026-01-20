using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private const int CacheDurationMinutes = 5;
        private const string AllMedicinesCacheKey = "Medicines_All";

        public MedicineService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<IEnumerable<MedicineDto>> GetFilteredAsync(MedicineFilterDto filter, CancellationToken cancellationToken = default)
        {
            try
            {
                var query = _unitOfWork.Medicines
                    .GetQueryable();

                if (filter.CategoryIds != null && filter.CategoryIds.Any())
                {
                    query = query.Where(m =>
                        m.CategoryId.HasValue &&
                        filter.CategoryIds.Contains(m.CategoryId.Value));
                }

                if (!string.IsNullOrWhiteSpace(filter.ActiveIngredient))
                {
                    query = query.Where(m =>
                        m.ActiveIngredient != null &&
                        m.ActiveIngredient.Contains(filter.ActiveIngredient));
                }

                if (!string.IsNullOrWhiteSpace(filter.CompanyName))
                {
                    query = query.Where(m =>
                        m.CompanyName != null &&
                        m.CompanyName.Contains(filter.CompanyName));
                }

                var medicines = await query
                    .ToListAsync(cancellationToken);

                return _mapper.Map<IEnumerable<MedicineDto>>(medicines);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while filtering medicines.",
                    ex);
            }
        }

        public async Task<IEnumerable<MedicineDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                if (_cache.TryGetValue<IEnumerable<MedicineDto>>(AllMedicinesCacheKey, out var cached) && cached != null)
                    return cached;

                var medicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);
                var result = _mapper.Map<IEnumerable<MedicineDto>>(medicines);

                _cache.Set(AllMedicinesCacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));
                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while fetching all medicines.", ex);
            }
        }

        public async Task<MedicineDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"Medicine_{id}";
            if (_cache.TryGetValue<MedicineDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            var result = _mapper.Map<MedicineDto>(medicine);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(CacheDurationMinutes));
            return result;
        }

        public async Task AddAsync(MedicineDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto), "Medicine data cannot be null.");

            try
            {
                var medicine = _mapper.Map<Medicine>(dto);
                await _unitOfWork.Medicines.AddAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _cache.Remove(AllMedicinesCacheKey);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("An error occurred while adding a new medicine.", ex);
            }
        }

        public async Task UpdateAsync(int id, MedicineDto dto, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            try
            {
                _mapper.Map(dto, medicine);
                await _unitOfWork.Medicines.UpdateAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _cache.Remove(AllMedicinesCacheKey);
                _cache.Remove($"Medicine_{id}");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"An error occurred while updating medicine ID={id}.", ex);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var medicine = await _unitOfWork.Medicines.GetByIdAsync(id, cancellationToken);
            if (medicine == null)
                throw new KeyNotFoundException($"Medicine with ID={id} was not found.");

            try
            {
                await _unitOfWork.Medicines.DeleteAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                _cache.Remove(AllMedicinesCacheKey);
                _cache.Remove($"Medicine_{id}");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"An error occurred while deleting medicine ID={id}.", ex);
            }
        }
    }
}
