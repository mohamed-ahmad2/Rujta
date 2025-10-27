using System;
using System.IO;
using Itinero;
using Itinero.LocalGeo;
using Microsoft.Extensions.Logging;

namespace Rujta.Infrastructure.Services
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
        public (double distance, double duration) GetRouteData(double fromLat, double fromLon, double toLat, double toLon)
        {
            try
            {
                var profile = _router.Db.GetSupportedProfile("car");
                if (profile == null)
                {
                    _logger.LogWarning("RouterDb does not contain a 'car' profile.");
                    return (double.MaxValue, double.MaxValue);
                }

                var start = _router.Resolve(profile, new Coordinate((float)fromLat, (float)fromLon));
                var end = _router.Resolve(profile, new Coordinate((float)toLat, (float)toLon));

                var route = _router.Calculate(profile, start, end);

                return (route.TotalDistance, route.TotalTime);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Routing failed for from ({FromLat},{FromLon}) to ({ToLat},{ToLon})", fromLat, fromLon, toLat, toLon);
                return (double.MaxValue, double.MaxValue);
            }
        }
    }
}
