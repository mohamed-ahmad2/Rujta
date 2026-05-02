using Rujta.Application.Interfaces.InterfaceServices.IGenericS;

namespace Rujta.Application.Interfaces.InterfaceServices
{
    public interface ICompanyService : IGenericService<CompanyDto, int>
    {
        public Task<IEnumerable<CompanyDto>> GetCompaniesMedicinesAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
