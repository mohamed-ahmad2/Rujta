using Rujta.Application.DTOs.AdDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Rujta.Application.Services
{
    public class AdService : IAdService
    {
        private readonly IAdRepository _adRepo;
        private readonly IMapper _mapper;
        public AdService(IAdRepository adRepo, IMapper mapper)
        {
            _adRepo = adRepo;
            _mapper = mapper;
        }
        public async Task<AdDto> CreateAsync(AdDto dto, CancellationToken cancellationToken = default)
        {
            var entity = _mapper.Map<Ad>(dto);
            entity.CreatedAt = DateTime.UtcNow;
            entity.IsActive = false;
            entity.StartsAt = null;
            entity.ExpiresAt = null;

            await _adRepo.AddAsync(entity, cancellationToken);
            await _adRepo.SaveChangesAsync(cancellationToken); // ✅ flush to DB → entity.Id gets populated

            return _mapper.Map<AdDto>(entity); // ✅ now returns real Id
        }
        public async Task<IEnumerable<AdDto>> GetAllActiveAsync(
     CancellationToken cancellationToken = default)
        {
            var ads = await _adRepo.GetAllActiveAsync(cancellationToken);
            return _mapper.Map<IEnumerable<AdDto>>(ads);
        }
        public async Task<IEnumerable<AdDto>> GetByPharmacyIdAsync(
    int pharmacyId,
    CancellationToken cancellationToken = default)
        {
            var ads = await _adRepo.GetByPharmacyIdAsync(pharmacyId, cancellationToken);
            return _mapper.Map<IEnumerable<AdDto>>(ads);
        }
        public async Task DeactivateAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var existing = await _adRepo.GetByIdAsync(id);
            if (existing is null)
                throw new KeyNotFoundException($"Ad with ID={id} not found.");
            await _adRepo.DeactivateAsync(id, cancellationToken);
        }
        public async Task SetStatusAsync(
            int id,
            bool isActive,
            CancellationToken cancellationToken = default)
        {
            var existing = await _adRepo.GetByIdAsync(id);
            if (existing is null)
                throw new KeyNotFoundException($"Ad with ID={id} not found.");
            await _adRepo.SetStatusAsync(id, isActive, cancellationToken);
        }
    }
}
