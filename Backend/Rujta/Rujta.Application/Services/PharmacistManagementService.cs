using Microsoft.Extensions.Caching.Memory;
using Rujta.Domain.Common;


namespace Rujta.Infrastructure.Services
{
    public class PharmacistManagementService : IPharmacistManagementService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public PharmacistManagementService(IUnitOfWork uow, IMapper mapper, IMemoryCache cache)
        {
            _uow = uow;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<IEnumerable<PharmacistDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            var cacheKey = "Pharmacists_All";

            if (_cache.TryGetValue(cacheKey, out IEnumerable<PharmacistDto>? cached) && cached != null)
                return cached;

            var entities = await _uow.Pharmacists.GetAllAsync(cancellationToken);
            var result = _mapper.Map<IEnumerable<PharmacistDto>>(entities);

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<PharmacistDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Pharmacist_{id}";

            if (_cache.TryGetValue(cacheKey, out PharmacistDto? cached) && cached != null)
                return cached;

            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            var result = _mapper.Map<PharmacistDto>(entity);

            if (result != null)
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task AddAsync(PharmacistDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Pharmacist>(dto);
            await _uow.Pharmacists.AddAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            _cache.Remove("Pharmacists_All");
            if (dto.PharmacyID.HasValue)
                _cache.Remove($"Pharmacists_Pharmacy_{dto.PharmacyID.Value}");
            if (dto.ManagerID != Guid.Empty)
                _cache.Remove($"Pharmacists_Manager_{dto.ManagerID}");
        }

        public async Task UpdateAsync(int id, PharmacistDto dto, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            _mapper.Map(dto, entity);
            await _uow.Pharmacists.UpdateAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            _cache.Remove($"Pharmacist_{id}");
            _cache.Remove("Pharmacists_All");
            if (dto.PharmacyID.HasValue)
                _cache.Remove($"Pharmacists_Pharmacy_{dto.PharmacyID.Value}");
            if (dto.ManagerID != Guid.Empty)
                _cache.Remove($"Pharmacists_Manager_{dto.ManagerID}");
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var entity = await _uow.Pharmacists.GetByIdAsync(id, cancellationToken);
            if (entity == null)
                return;

            await _uow.Pharmacists.DeleteAsync(entity, cancellationToken);
            await _uow.SaveAsync(cancellationToken);

            _cache.Remove($"Pharmacist_{id}");
            _cache.Remove("Pharmacists_All");
            if (entity.PharmacyId.HasValue)
                _cache.Remove($"Pharmacists_Pharmacy_{entity.PharmacyId.Value}");
            if (entity.ManagerId != Guid.Empty)
                _cache.Remove($"Pharmacists_Manager_{entity.ManagerId}");
        }
 
        public async Task<IEnumerable<PharmacistDto>> GetPharmacistByManagerAsync(Guid managerId, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Pharmacists_Manager_{managerId}";

            if (_cache.TryGetValue(cacheKey, out IEnumerable<PharmacistDto>? cached) && cached != null)
                return cached;

            var staffEntities = await _uow.Pharmacists.FindAsync(s => s.ManagerId == managerId, cancellationToken);
            var result = _mapper.Map<IEnumerable<PharmacistDto>>(staffEntities);

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<IEnumerable<PharmacistDto>> GetByPharmacyIdAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            var cacheKey = $"Pharmacists_Pharmacy_{pharmacyId}";

            if (_cache.TryGetValue(cacheKey, out IEnumerable<PharmacistDto>? cached) && cached != null)
                return cached;

            var entities = await _uow.Pharmacists.GetByPharmacyIdAsync(pharmacyId, cancellationToken);

            var result = _mapper.Map<IEnumerable<PharmacistDto>>(entities);

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }
    }
}
