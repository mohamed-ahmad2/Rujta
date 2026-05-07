using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Primitives;
using Rujta.Application.DTOs.Common;
using Rujta.Application.DTOs.MedicineDtos;
using Rujta.Application.Interfaces.InterfaceServices.IMedicine;

namespace Rujta.Application.Services.MedicineS 
{
    public class MedicineService : IMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        private const int CacheDurationMinutes = 5;
        private const int SlidingMinutes = 2;
        private const string AllMedicinesCacheKey = "Medicines_All";
        private const string MedicineByIdPrefix = "Medicine_";
        private const string MedicinePagePrefix = "Medicines_Page_";

        private static CancellationTokenSource _listCacheToken = new();

        public MedicineService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<PagedResultDto<MedicineDto>> GetPagedAsync(MedicineFilterDto filter, CancellationToken cancellationToken = default)
        {
            try
            {
                filter ??= new MedicineFilterDto();
                string cacheKey = BuildCacheKey(filter);

             
                if (_cache.TryGetValue<PagedResultDto<MedicineDto>>(cacheKey, out var cached)
                    && cached != null)
                    return cached;

                var query = _unitOfWork.Medicines.GetQueryable().AsNoTracking(); 

                if (filter.CategoryIds != null && filter.CategoryIds.Any())
                {
                    query = query.Where(m =>
                        m.CategoryId.HasValue &&
                        filter.CategoryIds.Contains(m.CategoryId.Value));
                }

                if (!string.IsNullOrWhiteSpace(filter.ActiveIngredient))
                {
                    var ai = filter.ActiveIngredient.Trim();
                    query = query.Where(m =>
                        m.ActiveIngredient != null &&
                        EF.Functions.Like(m.ActiveIngredient, $"%{ai}%"));
                }

                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                {
                    var term = filter.SearchTerm.Trim();
                    query = query.Where(m =>
                        (m.Name != null && EF.Functions.Like(m.Name, $"%{term}%")) ||
                        (m.ActiveIngredient != null && EF.Functions.Like(m.ActiveIngredient, $"%{term}%")));
                }

                var totalCount = await query.CountAsync(cancellationToken);

         
                var medicines = await query
                    .OrderBy(m => m.Id)
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToListAsync(cancellationToken);

                var result = new PagedResultDto<MedicineDto>
                {
                    Items = _mapper.Map<IEnumerable<MedicineDto>>(medicines),
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };


                var cacheOptions = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                    .SetSlidingExpiration(TimeSpan.FromMinutes(SlidingMinutes))
                    .AddExpirationToken(new CancellationChangeToken(_listCacheToken.Token));

                _cache.Set(cacheKey, result, cacheOptions);

                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while fetching paged medicines.", ex);
            }
        }

        public async Task<IEnumerable<MedicineDto>> GetFilteredAsync(
            MedicineFilterDto filter, CancellationToken cancellationToken = default)
        {

            var paged = await GetPagedAsync(filter, cancellationToken);
            return paged.Items;
        }

        public async Task<IEnumerable<MedicineDto>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            try
            {
                if (_cache.TryGetValue<IEnumerable<MedicineDto>>(AllMedicinesCacheKey, out var cached)
                    && cached != null)
                    return cached;

                var medicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);
                var result = _mapper.Map<IEnumerable<MedicineDto>>(medicines);

                var options = new MemoryCacheEntryOptions()
                    .SetAbsoluteExpiration(TimeSpan.FromMinutes(CacheDurationMinutes))
                    .AddExpirationToken(new CancellationChangeToken(_listCacheToken.Token));

                _cache.Set(AllMedicinesCacheKey, result, options);
                return result;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while fetching all medicines.", ex);
            }
        }

        public async Task<MedicineDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"{MedicineByIdPrefix}{id}";
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
                throw new ArgumentNullException(nameof(dto));

            try
            {
                var medicine = _mapper.Map<Medicine>(dto);
                await _unitOfWork.Medicines.AddAsync(medicine, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                InvalidateListCache(); 
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    "An error occurred while adding a new medicine.", ex);
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

                InvalidateListCache();
                _cache.Remove($"{MedicineByIdPrefix}{id}");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"An error occurred while updating medicine ID={id}.", ex);
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

                InvalidateListCache();
                _cache.Remove($"{MedicineByIdPrefix}{id}");
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException(
                    $"An error occurred while deleting medicine ID={id}.", ex);
            }
        }



        private static string BuildCacheKey(MedicineFilterDto f)
        {
            var cats = f.CategoryIds != null && f.CategoryIds.Any()
                ? string.Join(",", f.CategoryIds.OrderBy(x => x))
                : "_";

            return $"{MedicinePagePrefix}p{f.PageNumber}_s{f.PageSize}" +
                   $"_c{cats}_a{f.ActiveIngredient ?? "_"}_q{f.SearchTerm ?? "_"}";
        }

    
        private static void InvalidateListCache()
        {
            var oldToken = _listCacheToken;
            _listCacheToken = new CancellationTokenSource();
            oldToken.Cancel();
            oldToken.Dispose();
        }
    }
}