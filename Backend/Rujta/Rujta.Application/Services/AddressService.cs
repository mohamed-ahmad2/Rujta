using Microsoft.Extensions.Caching.Memory;

namespace Rujta.Application.Services
{
    public class AddressService : IAddressService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IOfflineGeocodingService _offlineGeocodingService;
        private readonly IMemoryCache _cache;
        private const double CoordinateTolerance = 0.0001;

        public AddressService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IOfflineGeocodingService offlineGeocodingService, IMemoryCache cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _offlineGeocodingService = offlineGeocodingService;
            _cache = cache;
        }

        public async Task AddByUserAsync(Guid userId, AddressDto dto, CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("Invalid userId");

            var (latitude, longitude) = await ResolveCoordinatesAsync(dto);
            dto.Latitude = latitude;
            dto.Longitude = longitude;

            var address = _mapper.Map<Address>(dto);

            address.PersonId = userId;

            await _unitOfWork.Address.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove("AllAddresses");
            _cache.Remove($"UserAddresses_{userId}");
            _cache.Remove($"UserProfile_{userId}");
        }



        public async Task AddAsync(AddressDto dto, CancellationToken cancellationToken = default)
        {
            var (latitude, longitude) = await ResolveCoordinatesAsync(dto);
            dto.Latitude = latitude;
            dto.Longitude = longitude;

            var address = _mapper.Map<Address>(dto);
            await _unitOfWork.Address.AddAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
            _cache.Remove("AllAddresses");
            if (address.PersonId != Guid.Empty)
            {
                _cache.Remove($"UserAddresses_{address.PersonId}");
                _cache.Remove($"UserProfile_{address.PersonId}");
            }

        }

        public async Task UpdateAsync(int id, AddressDto dto, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            var (latitude, longitude) = await ResolveCoordinatesAsync(dto);
            dto.Latitude = latitude;
            dto.Longitude = longitude;

            _mapper.Map(dto, address);
            await _unitOfWork.Address.UpdateAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);

            _cache.Remove("AllAddresses");
            _cache.Remove($"Address_{id}");
            if (address.PersonId != Guid.Empty)
            {
                _cache.Remove($"UserAddresses_{address.PersonId}");
                _cache.Remove($"UserProfile_{address.PersonId}");
            }

        }

        private static bool NeedsGeocoding(double latitude, double longitude)
        {
            return
                Math.Abs(latitude) < CoordinateTolerance ||
                Math.Abs(longitude) < CoordinateTolerance ||
                latitude < -90 || latitude > 90 ||
                longitude < -180 || longitude > 180;
        }

        private async Task<(double Latitude, double Longitude)> ResolveCoordinatesAsync(AddressDto dto)
        {
            if (!NeedsGeocoding(dto.Latitude, dto.Longitude))
                return (dto.Latitude, dto.Longitude);

            try
            {
                var result = await _offlineGeocodingService.GetCoordinatesAsync(
                    dto.Street,
                    dto.BuildingNo,
                    dto.City,
                    dto.Governorate);

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Offline geocoding failed for address {dto.Street}, {dto.BuildingNo}: {ex.Message}");
                return (dto.Latitude, dto.Longitude);
            }
        }

        public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
        {
            var address = await _unitOfWork.Address.GetByIdAsync(id, cancellationToken);
            if (address == null)
                throw new KeyNotFoundException("Address not found");

            await _unitOfWork.Address.DeleteAsync(address, cancellationToken);
            await _unitOfWork.SaveAsync(cancellationToken);
            _cache.Remove("AllAddresses");
            _cache.Remove($"Address_{id}");
            if (address.PersonId != Guid.Empty)
            {
                _cache.Remove($"UserAddresses_{address.PersonId}");
                _cache.Remove($"UserProfile_{address.PersonId}");
            }

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
            string cacheKey = "AllAddresses";
            if (_cache.TryGetValue<IEnumerable<AddressDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var addresses = await _unitOfWork.Address.GetAllAsync(cancellationToken);
            var result = _mapper.Map<IEnumerable<AddressDto>>(addresses);
            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }


        public async Task<List<AddressDto>> GetUserAddressesAsync(Guid userId, Guid personId, CancellationToken cancellationToken = default)
        {
            if (userId == Guid.Empty)
                throw new ArgumentException("Invalid userId");

            string cacheKey = $"UserAddresses_{personId}";

            if (_cache.TryGetValue<List<AddressDto>>(cacheKey, out var cached) && cached != null)
                return cached;

            var addresses = await _unitOfWork.Address.GetUserAddressesAsync(userId, cancellationToken);
            var result = _mapper.Map<List<AddressDto>>(addresses ?? new List<AddressDto>());

            _cache.Set(cacheKey, result, TimeSpan.FromMinutes(5));

            return result;
        }
    }
}
