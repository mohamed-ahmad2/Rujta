namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IGeocodingService
    {
        Task<(double Latitude, double Longitude)> GetCoordinatesAsync(string address, CancellationToken cancellationToken = default);
    }
}
