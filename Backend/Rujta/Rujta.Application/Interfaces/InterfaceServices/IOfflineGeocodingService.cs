namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface IOfflineGeocodingService
    {
        Task<(double Latitude, double Longitude)> GetCoordinatesAsync(string street, string buildingNo, string city, string governorate);
    }
}
