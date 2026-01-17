using F23.StringSimilarity;
using OsmSharp;
using OsmSharp.Streams;
using System.Collections.Concurrent;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;


namespace Rujta.Infrastructure.Services
{
    public class OfflineGeocodingService : IOfflineGeocodingService
    {
        private readonly ConcurrentDictionary<string, List<AddressNode>> _nodesByGovCity;
        private readonly ConcurrentDictionary<string, (double Latitude, double Longitude)> _cache;
        private readonly JaroWinkler _jw;

        public OfflineGeocodingService(string pbfFilePath)
        {
            var nodes = LoadAddressesFromPbf(pbfFilePath);
            _nodesByGovCity = BuildIndex(nodes);
            _cache = new ConcurrentDictionary<string, (double, double)>();
            _jw = new JaroWinkler();
        }

        private List<AddressNode> LoadAddressesFromPbf(string path)
        {
            using var fs = File.OpenRead(path);
            var source = new PBFOsmStreamSource(fs);

            var nodes = source
                .AsParallel()
                .OfType<Node>()
                .Where(n => n.Tags != null && n.Tags.ContainsKey("addr:street"))
                .Select(n => new AddressNode
                {
                    Street = NormalizeString(n.Tags["addr:street"]),
                    BuildingNo = n.Tags.ContainsKey("addr:housenumber") ? NormalizeString(n.Tags["addr:housenumber"]) : null,
                    City = n.Tags.ContainsKey("addr:city") ? NormalizeString(n.Tags["addr:city"]) : null,
                    Governorate = n.Tags.ContainsKey("addr:province") ? NormalizeString(n.Tags["addr:province"]) : null,
                    Latitude = n.Latitude!.Value,
                    Longitude = n.Longitude!.Value
                })
                .ToList();

            Console.WriteLine($"Loaded {nodes.Count} nodes from PBF");
            return nodes;
        }

        private static ConcurrentDictionary<string, List<AddressNode>> BuildIndex(List<AddressNode> nodes)
        {
            var index = new ConcurrentDictionary<string, List<AddressNode>>();

            Parallel.ForEach(nodes, node =>
            {
                var key = $"{node.Governorate?.ToLowerInvariant()}|{node.City?.ToLowerInvariant()}";
                var list = index.GetOrAdd(key, _ => new List<AddressNode>());
                lock (list)
                {
                    list.Add(node);
                }
            });

            return index;
        }

        public Task<(double Latitude, double Longitude)> GetCoordinatesAsync(
            string street, string? buildingNo, string? city, string? governorate)
        {
            street = NormalizeString(street?.Trim() ?? "");
            buildingNo = NormalizeString(buildingNo?.Trim());
            city = NormalizeString(city?.Trim());
            governorate = NormalizeString(governorate?.Trim());

            if (string.IsNullOrEmpty(street))
                return Task.FromResult((0.0, 0.0));

            string cacheKey = $"{street}|{buildingNo}|{city}|{governorate}";
            if (_cache.TryGetValue(cacheKey, out var cached))
                return Task.FromResult(cached);

            var indexKey = $"{governorate?.ToLowerInvariant()}|{city?.ToLowerInvariant()}";
            if (!_nodesByGovCity.TryGetValue(indexKey, out var filteredNodes) || filteredNodes == null || !filteredNodes.Any())
                filteredNodes = _nodesByGovCity.Values.SelectMany(v => v).ToList();

            var bestMatch = filteredNodes
                .AsParallel()
                .Select(n => new
                {
                    Node = n,
                    StreetScore = _jw.Similarity(n.Street, street),
                    BuildingScore = GetBuildingScore(n.BuildingNo, buildingNo)
                })
                .Select(x => new
                {
                    x.Node,
                    CombinedScore = x.StreetScore * 0.8 + x.BuildingScore * 0.2
                })
                .OrderByDescending(x => x.CombinedScore)
                .FirstOrDefault();

            (double Latitude, double Longitude) result = (0.0, 0.0);

            if (bestMatch != null)
                result = (bestMatch.Node.Latitude, bestMatch.Node.Longitude);

            _cache[cacheKey] = result;

            return Task.FromResult(result);
        }

        private static double GetBuildingScore(string? nodeBuildingNo, string? inputBuildingNo)
        {
            if (string.IsNullOrEmpty(inputBuildingNo) || string.IsNullOrEmpty(nodeBuildingNo))
                return 0.0;

            if (inputBuildingNo.Equals(nodeBuildingNo, StringComparison.OrdinalIgnoreCase))
                return 1.0;

            return new JaroWinkler().Similarity(nodeBuildingNo, inputBuildingNo);
        }

        private static string NormalizeString(string? input)
        {
            if (string.IsNullOrEmpty(input))
                return string.Empty;

            var regex = new Regex(@"[^\w\s]", RegexOptions.None, TimeSpan.FromMilliseconds(100));
            input = regex.Replace(input, "");

            input = new string(input.Normalize(NormalizationForm.FormD)
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray())
                .Normalize(NormalizationForm.FormC);

            return input.Trim().ToLowerInvariant();
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