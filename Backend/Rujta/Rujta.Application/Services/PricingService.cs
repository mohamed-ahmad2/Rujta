using Microsoft.Extensions.Caching.Memory;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;

namespace Rujta.Infrastructure.Services
{
    public class PricingService : IPricingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _cache;
        private const string CacheKey = "PricingConfig";

        public PricingService(IUnitOfWork unitOfWork, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
        }

        public async Task<PricingConfigDto> GetAsync(CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<PricingConfigDto>(CacheKey, out var cached) && cached != null)
                return cached;

            var config = await _unitOfWork.Pricing.GetAsync(cancellationToken)
                ?? new PricingConfig(); // fallback defaults

            var dto = ToDto(config);
            _cache.Set(CacheKey, dto, TimeSpan.FromMinutes(10));
            return dto;
        }

        public async Task<PricingConfigDto> UpdateAsync(
            PricingConfigDto dto,
            CancellationToken cancellationToken = default)
        {
            var config = await _unitOfWork.Pricing.GetAsync(cancellationToken);

            if (config == null)
            {
                config = FromDto(dto);
                await _unitOfWork.Pricing.AddAsync(config, cancellationToken);
            }
            else
            {
                // re-fetch tracked for update
                config = await _unitOfWork.Pricing.GetTrackedAsync(cancellationToken)
                    ?? config;
                ApplyDto(config, dto);
                await _unitOfWork.Pricing.UpdateAsync(config, cancellationToken);
            }

            config.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(CacheKey); // ✅ bust cache after save
            return ToDto(config);
        }

        // ─── Helpers ──────────────────────────────────────────────────────

        private static PricingConfigDto ToDto(PricingConfig c) => new()
        {
            SubscriptionMonthlyPrice = c.SubscriptionMonthlyPrice,
            SubscriptionYearlyPrice = c.SubscriptionYearlyPrice,
            AdWeeklyPrice = c.AdWeeklyPrice,
            AdBiweeklyPrice = c.AdBiweeklyPrice,
            AdMonthlyPrice = c.AdMonthlyPrice,
        };

        private static PricingConfig FromDto(PricingConfigDto dto) => new()
        {
            SubscriptionMonthlyPrice = dto.SubscriptionMonthlyPrice,
            SubscriptionYearlyPrice = dto.SubscriptionYearlyPrice,
            AdWeeklyPrice = dto.AdWeeklyPrice,
            AdBiweeklyPrice = dto.AdBiweeklyPrice,
            AdMonthlyPrice = dto.AdMonthlyPrice,
            UpdatedAt = DateTime.UtcNow,
        };

        private static void ApplyDto(PricingConfig config, PricingConfigDto dto)
        {
            config.SubscriptionMonthlyPrice = dto.SubscriptionMonthlyPrice;
            config.SubscriptionYearlyPrice = dto.SubscriptionYearlyPrice;
            config.AdWeeklyPrice = dto.AdWeeklyPrice;
            config.AdBiweeklyPrice = dto.AdBiweeklyPrice;
            config.AdMonthlyPrice = dto.AdMonthlyPrice;
        }
    }
}