using Microsoft.Extensions.Caching.Memory;
using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IAddressResolver _addressResolver;
        private readonly IMemoryCache _cache;

        public AddressService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IAddressResolver addressResolver,
            IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _addressResolver = addressResolver;
            _cache = cache;
        }


        public async Task AddByUserAsync(Guid userId, AddressDto dto, CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("Invalid userId");

            await _addressResolver.ResolveAsync(dto);

            var address = _mapper.Map<Address>(dto);
            address.PersonId = userId;

            await _unitOfWork.Address.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            InvalidateUserCache(userId);
        }


        public async Task AddAsync(AddressDto dto, CancellationToken cancellationToken = default)
        {
            await _addressResolver.ResolveAsync(dto);

            var address = _mapper.Map<Address>(dto);
            await _unitOfWork.Address.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove("AllAddresses");
            if (address.PersonId.HasValue && address.PersonId != Guid.Empty)
                InvalidateUserCache(address.PersonId.Value);
        }

        public async Task UpdateAsync(int id, AddressDto dto, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            await _addressResolver.ResolveAsync(dto);

            _mapper.Map(dto, address);
            await _unitOfWork.Address.UpdateAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove($"Address_{id}");
            _cache.Remove("AllAddresses");
            if (address.PersonId.HasValue && address.PersonId != Guid.Empty)
                InvalidateUserCache(address.PersonId.Value);
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            await _unitOfWork.Address.DeleteAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove($"Address_{id}");
            _cache.Remove("AllAddresses");
            if (address.PersonId.HasValue && address.PersonId != Guid.Empty)
                InvalidateUserCache(address.PersonId.Value);
        }

        public async Task<AddressDto?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            string cacheKey = $"Address_{id}";
            if (_cache.TryGetValue<AddressDto>(cacheKey, out var cached) && cached != null)
                return cached;

            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null) return null;

            var result = _mapper.Map<AddressDto>(address);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<IEnumerable<AddressDto>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            const string cacheKey = "AllAddresses";
            if (_cache.TryGetValue<IEnumerable<AddressDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var addresses = await _unitOfWork.Address.GetAllAsync(cancellationToken);
            var result = _mapper.Map<IEnumerable<AddressDto>>(addresses);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        public async Task<List<AddressDto>> GetUserAddressesAsync(
            Guid userId,
            Guid personId,
            CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("Invalid userId");

            string cacheKey = $"UserAddresses_{personId}";

            if (_cache.TryGetValue<List<AddressDto>>(cacheKey, out var cached) && cached != null)
                return cached;

   
            var result = await _unitOfWork.Address.GetUserAddressesAsync(userId, cancellationToken)
                         ?? new List<AddressDto>();

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }

        private void InvalidateUserCache(Guid personId)
        {
            _cache.Remove("AllAddresses");
            _cache.Remove($"UserAddresses_{personId}");
            _cache.Remove($"UserProfile_{personId}");
        }
    }
}