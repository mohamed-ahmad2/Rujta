using Rujta.Application.Interfaces.InterfaceRepositories;


namespace Rujta.Application.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IMedicineRepository Medicines { get; }
        IPharmacyRepository Pharmacies { get; }
        IOrderRepository Orders { get; }
        IUserRepository Users { get; }
        IRefreshTokenRepository RefreshTokens { get; }
         
        Task<int> SaveAsync(CancellationToken cancellationToken = default);
    }
}
