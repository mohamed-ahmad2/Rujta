using AutoMapper;
using F23.StringSimilarity;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.Interfaces;
using Rujta.Application.Interfaces.InterfaceServices;

namespace Rujta.Application.Services
{
    public class SearchMedicineService : ISearchMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly JaroWinkler _jaro;
        private readonly ILogger<SearchMedicineService> _logger;

        public SearchMedicineService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<SearchMedicineService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _jaro = new JaroWinkler();
            _logger = logger;
        }

        public async Task<IEnumerable<MedicineDto>> SearchAsync(string query, int top = 10, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Starting SearchAsync for query '{Query}' with top={Top}", query, top);

            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                _logger.LogWarning("Query is empty or too short: '{Query}'", query);
                return Enumerable.Empty<MedicineDto>();
            }

            try
            {
                var allMedicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);

                var rankedMedicines = allMedicines
                    .Select(m => new
                    {
                        Medicine = m,
                        Score = _jaro.Similarity(m.Name.ToLower(), query.ToLower())
                    })
                    .OrderByDescending(x => x.Score)
                    .Take(top)
                    .Select(x => x.Medicine)
                    .ToList();

                var topMedicines = _mapper.Map<List<MedicineDto>>(rankedMedicines);
                _logger.LogInformation("Returning {Count} ranked medicines for query '{Query}'", topMedicines.Count, query);

                return topMedicines;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while searching for medicines with query '{Query}'", query);
                return Enumerable.Empty<MedicineDto>();
            }
        }
    }
}
