using OsmSharp;
using OsmSharp.Streams;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Infrastructure.Services
{
    public class OfflineGeocodingService : IOfflineGeocodingService
    {
        private readonly List<AddressNode> _nodes;

        public OfflineGeocodingService(string pbfFilePath)
        {
            _nodes = LoadAddressesFromPbf(pbfFilePath);
        }

        private List<AddressNode> LoadAddressesFromPbf(string path)
        {
            using var fs = File.OpenRead(path);
            var source = new PBFOsmStreamSource(fs);

            var nodes = source
                .OfType<Node>()
                .Where(n => n.Tags != null && n.Tags.ContainsKey("addr:street"))
                .Select(n => new AddressNode
                {
                    Street = n.Tags["addr:street"],
                    BuildingNo = n.Tags.ContainsKey("addr:housenumber") ? n.Tags["addr:housenumber"] : null,
                    City = n.Tags.ContainsKey("addr:city") ? n.Tags["addr:city"] : null,
                    Governorate = n.Tags.ContainsKey("addr:province") ? n.Tags["addr:province"] : null,
                    Latitude = n.Latitude!.Value, 
                    Longitude = n.Longitude!.Value 
                })
                .ToList();

            return nodes;
        }

        public Task<(double Latitude, double Longitude)> GetCoordinatesAsync(
            string street, string? buildingNo, string? city, string? governorate)
        {
            var node = _nodes
                .FirstOrDefault(n =>
                    n.Street.Equals(street, StringComparison.OrdinalIgnoreCase) &&
                    (string.IsNullOrEmpty(buildingNo) || n.BuildingNo == buildingNo) &&
                    (string.IsNullOrEmpty(city) || n.City?.Equals(city, StringComparison.OrdinalIgnoreCase) == true) &&
                    (string.IsNullOrEmpty(governorate) || n.Governorate?.Equals(governorate, StringComparison.OrdinalIgnoreCase) == true)
                );

            if (node != null)
                return Task.FromResult((node.Latitude, node.Longitude));

            return Task.FromResult((0.0, 0.0));
        }

        internal sealed record AddressNode
        {
            public string Street { get; set; } = string.Empty;
            public string? BuildingNo { get; set; }
            public string? City { get; set; }
            public string? Governorate { get; set; }
            public double Latitude { get; set; }
            public double Longitude { get; set; }
        }
    }
}
