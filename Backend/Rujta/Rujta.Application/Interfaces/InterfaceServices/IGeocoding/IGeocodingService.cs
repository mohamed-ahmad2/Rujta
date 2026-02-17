namespace Rujta.Application.Interfaces.InterfaceServices.IGeocoding
{
    public interface IGeocodingService
    {
        Task<(double Latitude, double Longitude)> GetCoordinatesAsync(string address, CancellationToken cancellationToken = default);
    }
}
