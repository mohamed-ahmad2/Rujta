using Rujta.Application.Interfaces.InterfaceServices;
using System.Globalization;
using System.Text.Json;

namespace Rujta.Application.Services
{
    public class GeocodingService : IGeocodingService
    {
        private readonly HttpClient _httpClient;

        public GeocodingService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("RujtaApp/1.0 (contact: rujtaproject@gmail.com)");
        }

        public async Task<(double Latitude, double Longitude)> GetCoordinatesAsync(string address,CancellationToken cancellationToken = default)
        {
            var url =
                    $"https://nominatim.openstreetmap.org/search" +
                    $"?q={Uri.EscapeDataString(address)}" +
                    $"&format=json" +
                    $"&limit=1" +
                    $"&addressdetails=1" +
                    $"&accept-language=en" +
                    $"&countrycodes=eg";


            using var response = await _httpClient.GetAsync(url, cancellationToken);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(cancellationToken);

            var result = JsonSerializer.Deserialize<List<NominatimResult>>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (result is null || result.Count == 0)
                throw new InvalidOperationException($"Unable to geocode address: {address}");

            return (
                Latitude: double.Parse(result[0].Lat, CultureInfo.InvariantCulture),
                Longitude: double.Parse(result[0].Lon, CultureInfo.InvariantCulture)
            );
        }
    }

    internal sealed record NominatimResult
    {
        public string Lat { get; init; } = string.Empty;
        public string Lon { get; init; } = string.Empty;
    }
}
