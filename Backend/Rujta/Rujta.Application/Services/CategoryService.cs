using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private const string AllCategoriesCacheKey = "AllCategories";

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task AddAsync(CategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var category = _mapper.Map<Category>(dto);
            await _unitOfWork.Categories.AddAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCategoriesCacheKey);
            _cache.Remove(GetCategoryCacheKey(category.Id));
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null)
                throw new KeyNotFoundException($"Category with Id={id} not found.");

            await _unitOfWork.Categories.DeleteAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCategoriesCacheKey);
            _cache.Remove(GetCategoryCacheKey(id));
        }

        public async Task<IEnumerable<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<IEnumerable<CategoryDto>>(AllCategoriesCacheKey, out var cached) && cached != null)
                return cached;

            var categories = await _unitOfWork.Categories.GetAllAsync(cancellationToken);
            var result = _mapper.Map<IEnumerable<CategoryDto>>(categories);

            _cache.Set(AllCategoriesCacheKey, result, TimeSpan.FromMinutes(5));
            return result;
        }

        public async Task<CategoryDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var cacheKey = GetCategoryCacheKey(id);
            if (_cache.TryGetValue<CategoryDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null) return null;

            var result = _mapper.Map<CategoryDto>(category);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task UpdateAsync(int id, CategoryDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var category = await _unitOfWork.Categories.GetByIdAsync(id, cancellationToken);
            if (category == null)
                throw new KeyNotFoundException($"Category with Id={id} not found.");

            _mapper.Map(dto, category);

            await _unitOfWork.Categories.UpdateAsync(category, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCategoriesCacheKey);
            _cache.Remove(GetCategoryCacheKey(id));
        }

        private static string GetCategoryCacheKey(int id) => $"Category_{id}";
    }
}
