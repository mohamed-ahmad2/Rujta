using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;
        private const string AllCompaniesCacheKey = "AllCompanies";

        private static string GetCompanyCacheKey(int id)
            => $"Company_{id}";
        private static string GetPharmacyCompaniesCacheKey(int pharmacyId)
            => $"PharmacyCompanies_{pharmacyId}";

        public CompanyService(IUnitOfWork unitOfWork, IMapper mapper, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<IEnumerable<CompanyDto>> GetCompaniesMedicinesAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            var cacheKey = GetPharmacyCompaniesCacheKey(pharmacyId);

            if (_cache.TryGetValue<IEnumerable<CompanyDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var companies = await _unitOfWork.Companies
                .GetCompaniesMedicinesAsync(pharmacyId, cancellationToken);

            var result = _mapper.Map<IEnumerable<CompanyDto>>(companies);

            if (result.Any())
                _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<IEnumerable<CompanyDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            if (_cache.TryGetValue<IEnumerable<CompanyDto>>(AllCompaniesCacheKey, out var cached) && cached != null)
                return cached;

            var companies = await _unitOfWork.Companies.GetAllAsync(cancellationToken);
            var result = _mapper.Map<IEnumerable<CompanyDto>>(companies);

            _cache.Set(AllCompaniesCacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<CompanyDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            var cacheKey = GetCompanyCacheKey(id);

            if (_cache.TryGetValue<CompanyDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);
            if (company == null) return null;

            var result = _mapper.Map<CompanyDto>(company);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task AddAsync(CompanyDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var company = _mapper.Map<Company>(dto);
            await _unitOfWork.Companies.AddAsync(company, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCompaniesCacheKey);
            _cache.Remove(GetCompanyCacheKey(company.Id));
        }

        public async Task UpdateAsync(int id, CompanyDto dto, CancellationToken cancellationToken = default)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);
            if (company == null)
                throw new KeyNotFoundException($"Company with Id={id} not found.");

            _mapper.Map(dto, company);

            await _unitOfWork.Companies.UpdateAsync(company, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCompaniesCacheKey);
            _cache.Remove(GetCompanyCacheKey(id));
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var company = await _unitOfWork.Companies.GetByIdAsync(id, cancellationToken);
            if (company == null)
                throw new KeyNotFoundException($"Company with Id={id} not found.");

            await _unitOfWork.Companies.DeleteAsync(company, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove(AllCompaniesCacheKey);
            _cache.Remove(GetCompanyCacheKey(id));
        }
    }
}