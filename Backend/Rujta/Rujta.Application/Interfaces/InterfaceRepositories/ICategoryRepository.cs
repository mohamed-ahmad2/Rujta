namespace Rujta.Application.Interfaces.InterfaceRepositories
{
    public interface ICategoryRepository : IGenericRepository<Category, int>
    {
        public Task<IEnumerable<Category>> GetCategoriesMedicinesAsync(int pharmacyId, CancellationToken cancellationToken = default);
    }
}
