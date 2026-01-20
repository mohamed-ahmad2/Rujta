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
        private readonly List<string> _uniqueGovernorates;
        private readonly List<string> _uniqueCities;
        private readonly ConcurrentDictionary<string, (double Latitude, double Longitude)> _cache;
        private readonly JaroWinkler _jw;

        public OfflineGeocodingService(string pbfFilePath)
        {
            _nodesByGovCity = LoadAndIndexAddressesFromPbf(pbfFilePath);

            _uniqueGovernorates = _nodesByGovCity.Keys
                .Select(k => k.Split('|')[0])
                .Where(g => !string.IsNullOrEmpty(g))
                .Distinct()
                .ToList();

            _uniqueCities = _nodesByGovCity.Keys
                .Select(k => { var parts = k.Split('|'); return parts.Length > 1 ? parts[1] : ""; })
                .Where(c => !string.IsNullOrEmpty(c))
                .Distinct()
                .ToList();

            _cache = new ConcurrentDictionary<string, (double, double)>();
            _jw = new JaroWinkler();
        }

        private ConcurrentDictionary<string, List<AddressNode>> LoadAndIndexAddressesFromPbf(string path)
        {
            using var fs = File.OpenRead(path);
            var source = new PBFOsmStreamSource(fs);

            var index = new ConcurrentDictionary<string, List<AddressNode>>();

            var addressNodesQuery = source
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
                });

            int count = 0;

            Parallel.ForEach(addressNodesQuery, node =>
            {
                var key = $"{node.Governorate?.ToLowerInvariant()}|{node.City?.ToLowerInvariant()}";
                var list = index.GetOrAdd(key, _ => new List<AddressNode>());
                lock (list)
                {
                    list.Add(node);
                }
                Interlocked.Increment(ref count);
            });

            Console.WriteLine($"Loaded {count} nodes from PBF");
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

            if (!string.IsNullOrEmpty(governorate))
            {
                var bestGov = FindBestMatch(governorate, _uniqueGovernorates);
                if (bestGov.Score >= 0.85)
                {
                    governorate = bestGov.Match;
                }
            }

            if (!string.IsNullOrEmpty(city))
            {
                var bestCity = FindBestMatch(city, _uniqueCities);
                if (bestCity.Score >= 0.85)
                {
                    city = bestCity.Match;
                }
            }

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

        private (string Match, double Score) FindBestMatch(string input, IEnumerable<string> candidates)
        {
            if (!candidates.Any()) return ("", 0.0);

            return candidates
                .AsParallel()
                .Select(c => (Match: c, Score: _jw.Similarity(c, input)))
                .OrderByDescending(x => x.Score)
                .First();
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