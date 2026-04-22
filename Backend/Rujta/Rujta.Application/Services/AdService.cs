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

        public AdService(IAdRepository adRepo)
        {
            _adRepo = adRepo;
        }
        public async Task<AdDto> CreateAsync(
            AdDto dto,
            CancellationToken cancellationToken = default)
        {
            var entity = MapToEntity(dto);
            entity.CreatedAt = DateTime.UtcNow;
            entity.IsActive = true;

            await _adRepo.AddAsync(entity);           
            return MapToDto(entity);
        }

        public async Task<IEnumerable<AdDto>> GetAllActiveAsync(
            CancellationToken cancellationToken = default)
        {
            var ads = await _adRepo.GetAllActiveAsync(cancellationToken);
            return ads.Select(MapToDto);
        }

        public async Task<IEnumerable<AdDto>> GetByPharmacyIdAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var ads = await _adRepo.GetByPharmacyIdAsync(pharmacyId, cancellationToken);
            return ads.Select(MapToDto);
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

        private static Ad MapToEntity(AdDto dto) => new()
        {
            PharmacyId = dto.PharmacyId,
            TemplateName = dto.TemplateName,
            Badge = dto.Badge,
            AdMode = dto.AdMode,
            MedicineId = dto.MedicineId,
            MedicineName = dto.MedicineName,
            MedicineImage = dto.MedicineImage,
            Category = dto.Category,
            Headline = dto.Headline,
            Subtext = dto.Subtext,
            CtaLabel = dto.CtaLabel,
            ColorFrom = dto.ColorFrom,
            ColorTo = dto.ColorTo,
            ColorAccent = dto.ColorAccent,
            FontLabel = dto.FontLabel,
            IsActive = dto.IsActive,
        };

        private static AdDto MapToDto(Ad entity) => new()
        {
            Id = entity.Id,
            PharmacyId = entity.PharmacyId,
            TemplateName = entity.TemplateName,
            Badge = entity.Badge,
            AdMode = entity.AdMode,
            MedicineId = entity.MedicineId,
            MedicineName = entity.MedicineName,
            MedicineImage = entity.MedicineImage,
            Category = entity.Category,
            Headline = entity.Headline,
            Subtext = entity.Subtext,
            CtaLabel = entity.CtaLabel,
            ColorFrom = entity.ColorFrom,
            ColorTo = entity.ColorTo,
            ColorAccent = entity.ColorAccent,
            FontLabel = entity.FontLabel,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
        };
    }

}
