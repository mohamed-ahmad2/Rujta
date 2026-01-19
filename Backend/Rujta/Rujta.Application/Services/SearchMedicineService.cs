using F23.StringSimilarity;

namespace Rujta.Application.Services
{
    public class SearchMedicineService : ISearchMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly JaroWinkler _jaro;
        private readonly ILogger<SearchMedicineService> _logger;

        private const double SimilarityThreshold = 0.75;

        public SearchMedicineService(IUnitOfWork unitOfWork,IMapper mapper,ILogger<SearchMedicineService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _jaro = new JaroWinkler();
        }

        public async Task<IEnumerable<MedicineDto>> SearchAsync(string query,int top = 10,CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Starting SearchAsync for query '{Query}' with top={Top}",query, top);

            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                _logger.LogWarning("Query is empty or too short: '{Query}'", query);
                return Enumerable.Empty<MedicineDto>();
            }

            try
            {
                var normalizedQuery = query.Trim().ToLowerInvariant();

                var allMedicines = await _unitOfWork.Medicines
                    .GetAllAsync(cancellationToken);

                var prefixMatches = allMedicines
                    .Where(m =>
                        !string.IsNullOrWhiteSpace(m.Name) &&
                        m.Name.StartsWith(normalizedQuery, StringComparison.OrdinalIgnoreCase))
                    .Select(m => new
                    {
                        Medicine = m,
                        Score = _jaro.Similarity(m.Name!.ToLowerInvariant(), normalizedQuery)
                    })
                    .OrderByDescending(x => x.Score)
                    .Take(top)
                    .Select(x => x.Medicine)
                    .ToList();

                if (prefixMatches.Any())
                {
                    _logger.LogInformation(
                        "Prefix search returned {Count} results for query '{Query}'",
                        prefixMatches.Count, query);

                    return _mapper.Map<IEnumerable<MedicineDto>>(prefixMatches);
                }

                var fuzzyMatches = allMedicines
                    .Where(m => !string.IsNullOrWhiteSpace(m.Name))
                    .Select(m => new
                    {
                        Medicine = m,
                        Score = _jaro.Similarity(m.Name!.ToLowerInvariant(), normalizedQuery)
                    })
                    .Where(x => x.Score >= SimilarityThreshold)
                    .OrderByDescending(x => x.Score)
                    .Take(top)
                    .Select(x => x.Medicine)
                    .ToList();

                _logger.LogInformation("Fuzzy search returned {Count} results for query '{Query}'",fuzzyMatches.Count, query);

                return _mapper.Map<IEnumerable<MedicineDto>>(fuzzyMatches);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error occurred while searching for medicines with query '{Query}'",
                    query);

                return Enumerable.Empty<MedicineDto>();
            }
        }
    }
}
