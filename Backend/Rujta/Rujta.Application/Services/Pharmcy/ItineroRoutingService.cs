using Itinero;
using Itinero.LocalGeo;

namespace Rujta.Application.Services.Pharmcy
{
    public class ItineroRoutingService
    {
        private readonly Router _router;
        private readonly ILogger<ItineroRoutingService> _logger;

        public ItineroRoutingService(string routerDbPath, ILogger<ItineroRoutingService> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            if (string.IsNullOrWhiteSpace(routerDbPath))
            {
                _logger.LogError("RouterDb path is null or empty.");
                throw new ArgumentException("RouterDb path is null or empty.", nameof(routerDbPath));
            }

            if (!File.Exists(routerDbPath))
            {
                _logger.LogError("RouterDb file not found: {Path}", routerDbPath);
                throw new FileNotFoundException($"RouterDb file not found: {routerDbPath}", routerDbPath);
            }

            try
            {
                using var stream = File.OpenRead(routerDbPath);
                var routerDb = RouterDb.Deserialize(stream);
                _router = new Router(routerDb);
                _logger.LogInformation("RouterDb loaded successfully from {Path}", routerDbPath);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Failed to load RouterDb from {routerDbPath}", ex);
            }
        }

        // Returns (distance in meters, duration in seconds)
        public (double distance, double duration, List<(double lat, double lng)> shape) GetRouteData(
    double fromLat, double fromLon,
    double toLat, double toLon,
    Itinero.Profiles.Profile profile)
        {
            try
            {
                var supportedProfile = _router.Db.GetSupportedProfile(profile.Name);
                if (supportedProfile == null)
                {
                    _logger.LogWarning("Profile '{ProfileName}' not supported.", profile.Name);
                    return (double.MaxValue, double.MaxValue, new());
                }

                var start = _router.Resolve(
                    supportedProfile,
                    new Coordinate((float)fromLat, (float)fromLon));

                var end = _router.Resolve(
                    supportedProfile,
                    new Coordinate((float)toLat, (float)toLon), 200f);

                var route = _router.Calculate(supportedProfile, start, end);

                // Extract route geometry
                var shape = route.Shape
                    .Select(p => (
                        lat: (double)p.Latitude,
                        lng: (double)p.Longitude))
                    .ToList();

                return (
                    route.TotalDistance,
                    route.TotalTime,
                    shape
                );
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Routing failed from ({FromLat},{FromLon}) to ({ToLat},{ToLon})",
                    fromLat, fromLon, toLat, toLon);

                return (double.MaxValue, double.MaxValue, new());
            }
        }

    }
}
