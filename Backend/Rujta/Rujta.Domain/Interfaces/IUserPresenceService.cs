// IUserPresenceService.cs (Modified: Removed event)
namespace Rujta.Domain.Interfaces
{
    public interface IUserPresenceService
    {
        void UserConnected(string userId, string pharmacyId, string connectionId);
        void UserDisconnected(string connectionId);
        IEnumerable<string> GetOnlinePharmacists(string pharmacyId);
        IEnumerable<string> GetConnectionIds(string userId);

        Task ForceLogoutAsync(string userId);
    }
}