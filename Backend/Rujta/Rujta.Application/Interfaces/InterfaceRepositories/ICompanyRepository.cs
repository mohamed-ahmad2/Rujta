namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface ICompanyRepository : IGenericRepository<Company, int>
    {
        public Task<IEnumerable<Company>> GetCompaniesMedicinesAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
