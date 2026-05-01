using Microsoft.Extensions.Caching.Memory;
using Rujta.Application.DTOs.DiscountDtos;
using Rujta.Application.Exceptions;

namespace Rujta.Application.Services
{
    public class DiscountService : IDiscountService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public DiscountService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<Discount?> GetBestDiscountAsync(InventoryItem item)
        {
            if (item.Medicine is null)
                throw new NotFoundException(
                    "Medicine data not loaded for this inventory item");

            var discounts = await _unitOfWork.Discount.GetMatchedDiscountsAsync(
                item.PharmacyID,
                item.MedicineID,
                item.Medicine.CategoryId,
                item.Medicine.CompanyId);

            if (!discounts.Any())
                return null;

            return discounts
                .OrderBy(d => d.Scope switch
                {
                    DiscountScope.Medicine => 0,
                    DiscountScope.Category => 1,
                    DiscountScope.Company => 2,
                    _ => 3
                })
                .ThenByDescending(d => d.Value)
                .First();
        }

        public async Task<decimal> ApplyDiscountAsync(InventoryItem item)
        {
            var bestDiscount = await GetBestDiscountAsync(item);

            if (bestDiscount is null)
                return item.Medicine!.Price;

            var finalPrice = bestDiscount.Type == DiscountType.Percentage
                ? item.Medicine!.Price - (item.Medicine.Price * bestDiscount.Value / 100)
                : item.Medicine!.Price - bestDiscount.Value;

            return Math.Max(finalPrice, 0);
        }

        public async Task ValidateDiscountScopeAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            switch (dto.Scope)
            {
                case DiscountScope.Medicine:
                    await ValidateMedicineScopeAsync(dto, pharmacyId);
                    break;

                case DiscountScope.Category:
                    await ValidateCategoryScopeAsync(dto, pharmacyId);
                    break;

                case DiscountScope.Company:
                    await ValidateCompanyScopeAsync(dto, pharmacyId);
                    break;

                default:
                    throw new ValidationException("Invalid Discount Scope");
            }
        }

        public async Task<Discount> CreateDiscountAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            ValidateDiscountDates(dto);
            await ValidateDiscountScopeAsync(dto, pharmacyId);
            await ValidateNoDuplicateDiscountAsync(dto, pharmacyId); 
            await ValidateDiscountValueAsync(dto, pharmacyId);

            var discount = _mapper.Map<Discount>(dto);
            discount.PharmacyId = pharmacyId;

            await _unitOfWork.Discount.AddAsync(discount);
            await _unitOfWork.SaveAsync();

            InvalidateCache(pharmacyId);

            return discount;
        }

        public async Task DeleteAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var discount = await _unitOfWork.Discount
                .GetByIdAsync(id, cancellationToken)
                ?? throw new NotFoundException("Discount not found");

            if (discount.PharmacyId != pharmacyId)
                throw new ValidationException(
                    "You can only delete your own discounts");

            await _unitOfWork.Discount.DeleteAsync(discount, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateCache(pharmacyId);
        }

        public async Task DeactivateAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var discount = await _unitOfWork.Discount
                .GetByIdAsync(id, cancellationToken)
                ?? throw new NotFoundException("Discount not found");

            if (discount.PharmacyId != pharmacyId)
                throw new ValidationException(
                    "You can only deactivate your own discounts");

            discount.IsActive = false;
            await _unitOfWork.Discount.UpdateAsync(discount, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateCache(pharmacyId);
        }

        public async Task<IEnumerable<DiscountDto>> GetByPharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var discounts = await _unitOfWork.Discount
                .GetActiveDiscountsByPharmacyAsync(pharmacyId);

            return _mapper.Map<IEnumerable<DiscountDto>>(discounts);
        }

        public async Task<DiscountDto?> GetByIdAsync(
            int id,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var discount = await _unitOfWork.Discount
                .GetByIdAsync(id, cancellationToken);

            if (discount == null || discount.PharmacyId != pharmacyId)
                return null;

            return _mapper.Map<DiscountDto>(discount);
        }

        private void InvalidateCache(int pharmacyId)
        {
            _cache.Remove($"InventoryItems_Pharmacy_{pharmacyId}");
            _cache.Remove($"Medicines_Pharmacy_{pharmacyId}");
            _cache.Remove("InventoryItems_All");
        }

        
        private async Task ValidateMedicineScopeAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            if (dto.MedicineId is null)
                throw new ValidationException("MedicineId is required");

            if (dto.CategoryId is not null || dto.CompanyId is not null)
                throw new ValidationException("Only MedicineId should be set");

            var exists = await _unitOfWork.InventoryItems
                .AnyAsync(i => i.MedicineID == dto.MedicineId
                            && i.PharmacyID == pharmacyId);

            if (!exists)
                throw new NotFoundException(
                    "Medicine not found in your inventory");
        }

        private async Task ValidateCategoryScopeAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            if (dto.CategoryId is null)
                throw new ValidationException("CategoryId is required");

            if (dto.MedicineId is not null || dto.CompanyId is not null)
                throw new ValidationException("Only CategoryId should be set");

            var exists = await _unitOfWork.InventoryItems
                .AnyAsync(i => i.Medicine!.CategoryId == dto.CategoryId
                            && i.PharmacyID == pharmacyId);

            if (!exists)
                throw new NotFoundException(
                    "No medicines from this category in your inventory");
        }

        private async Task ValidateCompanyScopeAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            if (dto.CompanyId is null)
                throw new ValidationException("CompanyId is required");

            if (dto.MedicineId is not null || dto.CategoryId is not null)
                throw new ValidationException("Only CompanyId should be set");

            var exists = await _unitOfWork.InventoryItems
                .AnyAsync(i => i.Medicine!.CompanyId == dto.CompanyId
                            && i.PharmacyID == pharmacyId);

            if (!exists)
                throw new NotFoundException(
                    "No medicines from this company in your inventory");
        }

        
        private static void ValidateDiscountDates(CreateDiscountDto dto)
        {
            if (dto.StartDate >= dto.EndDate)
                throw new ValidationException("End date must be after start date");

            if (dto.EndDate < DateTime.UtcNow)
                throw new ValidationException("End date cannot be in the past");
        }

        
        private async Task ValidateNoDuplicateDiscountAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            var hasActive = await _unitOfWork.Discount.HasActiveDiscountAsync(
                pharmacyId,
                dto.Scope,
                dto.MedicineId,
                dto.CategoryId,
                dto.CompanyId);

            if (!hasActive) return;

            var target = dto.Scope switch
            {
                DiscountScope.Medicine => "this medicine",
                DiscountScope.Category => "this category",
                DiscountScope.Company => "this company",
                _ => "this item"
            };

            throw new ValidationException(
                $"An active discount already exists for {target}. " +
                $"Please deactivate or wait for the existing discount to expire " +
                $"before creating a new one.");
        }

        
        private async Task ValidateDiscountValueAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            if (dto.Value <= 0)
                throw new ValidationException(
                    "Discount value must be greater than 0");

          
            if (dto.Type == DiscountType.Percentage)
            {
                if (dto.Value >= 100)
                    throw new ValidationException(
                        "Percentage discount must be less than 100%");
                return;
            }

          
            var minPrice = await GetMinAffectedPriceAsync(dto, pharmacyId);

            if (minPrice is null)
                return;

            if (dto.Value >= minPrice.Value)
            {
                throw new ValidationException(
                    $"Fixed discount value ({dto.Value:F2}) must be less than " +
                    $"the medicine price ({minPrice.Value:F2})");
            }
        }

        private async Task<decimal?> GetMinAffectedPriceAsync(
            CreateDiscountDto dto,
            int pharmacyId)
        {
            return dto.Scope switch
            {
                DiscountScope.Medicine => await _unitOfWork.InventoryItems
                    .GetMinMedicinePriceAsync(
                        i => i.MedicineID == dto.MedicineId
                          && i.PharmacyID == pharmacyId),

                DiscountScope.Category => await _unitOfWork.InventoryItems
                    .GetMinMedicinePriceAsync(
                        i => i.Medicine!.CategoryId == dto.CategoryId
                          && i.PharmacyID == pharmacyId),

                DiscountScope.Company => await _unitOfWork.InventoryItems
                    .GetMinMedicinePriceAsync(
                        i => i.Medicine!.CompanyId == dto.CompanyId
                          && i.PharmacyID == pharmacyId),

                _ => null
            };
        }
    }
}