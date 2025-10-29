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
        public (double distance, double duration) GetRouteData(
     double fromLat, double fromLon,
     double toLat, double toLon,
     Itinero.Profiles.Profile profile)
        {
            try
            {
                // ✅ Check correct profile exists
                var supportedProfile = _router.Db.GetSupportedProfile(profile.Name);
                if (supportedProfile == null)
                {
                    _logger.LogWarning("Profile '{ProfileName}' not supported by RouterDb.", profile.Name);
                    return (double.MaxValue, double.MaxValue);
                }

                // ✅ Resolve using selected profile
                var start = _router.Resolve(supportedProfile,
                    new Coordinate((float)fromLat, (float)fromLon));
                var end = _router.Resolve(supportedProfile,
                    new Coordinate((float)toLat, (float)toLon));

                // ✅ Route using selected profile
                var route = _router.Calculate(supportedProfile, start, end);

                // ✅ TotalTime is already in seconds
                return (route.TotalDistance, route.TotalTime);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex,
                    "Routing failed for from ({FromLat},{FromLon}) to ({ToLat},{ToLon})",
                    fromLat, fromLon, toLat, toLon);

                return (double.MaxValue, double.MaxValue);
            }
        }

    }
}
