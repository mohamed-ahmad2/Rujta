using Rujta.Application.DTOs.CustomerDtos;

namespace Rujta.Application.Resolver
{
    public class AddressResolver : IAddressResolver
    {
        private const double CoordinateTolerance = 0.0001;
        private readonly IOfflineGeocodingService _geocoding;
        private readonly ILogger<AddressResolver> _logger;

        public AddressResolver(IOfflineGeocodingService geocoding, ILogger<AddressResolver> logger)
        {
            _geocoding = geocoding;
            _logger = logger;
        }

        public async Task<AddressDto> ResolveAsync(AddressDto dto)
        {
            if (!NeedsGeocoding(dto.Latitude, dto.Longitude))
                return dto;

            try
            {
                var (lat, lng) = await _geocoding.GetCoordinatesAsync(
                    dto.Street, dto.BuildingNo, dto.City, dto.Governorate);

                dto.Latitude = lat;
                dto.Longitude = lng;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Geocoding failed for {Street}, {City}", dto.Street, dto.City);
            }

            return dto;
        }

        private static bool NeedsGeocoding(double lat, double lng)
            => Math.Abs(lat) < CoordinateTolerance ||
               Math.Abs(lng) < CoordinateTolerance ||
               lat < -90 || lat > 90 ||
               lng < -180 || lng > 180;
    }
}
