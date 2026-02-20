using Rujta.Application.Interfaces.InterfaceServices.IMedicine;

namespace Rujta.Application.Services.MedicineS
{
    public class SearchMedicineService : ISearchMedicineService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly JaroWinkler _jaro;
        private readonly ILogger<SearchMedicineService> _logger;
        private readonly IMedicineAutocompleteIndex _autocomplete;

        private const double SimilarityThreshold = 0.75;
        private const double PurchasedBoost = 0.2;

        public SearchMedicineService(IUnitOfWork unitOfWork,IMapper mapper,IMedicineAutocompleteIndex autocomplete,ILogger<SearchMedicineService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _autocomplete = autocomplete;
            _logger = logger;
            _jaro = new JaroWinkler();
        }

        public async Task<IEnumerable<MedicineDto>> SearchAsync( string query,Guid userId,int top = 10,CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                _logger.LogWarning("Search query too short or empty: '{Query}'", query);
                return Enumerable.Empty<MedicineDto>();
            }

            var normalizedQuery = query.Trim().ToLowerInvariant();
            _logger.LogInformation("Starting search for '{Query}' (UserId: {UserId})", query, userId);


            var userPurchasedIds = await _unitOfWork.Orders
                .GetUserPurchasedMedicineIdsAsync(userId, cancellationToken);

            var prefixMatches = _autocomplete.SearchByPrefix(normalizedQuery, top);
            _logger.LogInformation("Prefix search found {Count} results for query '{Query}'", prefixMatches.Count, query);

            if (prefixMatches.Any())
            {
                var medicines = await _unitOfWork.Medicines
                    .GetByNamesAsync(prefixMatches, cancellationToken);

                var ranked = medicines
                    .Select(m => new
                    {
                        Medicine = m,
                        Boost = userPurchasedIds.Contains(m.Id) ? 1 : 0
                    })
                    .OrderByDescending(x => x.Boost)
                    .ThenBy(m => m.Medicine.Name)
                    .Select(x => x.Medicine)
                    .ToList();

                _logger.LogInformation("Returning {Count} results from prefix search after ranking for UserId {UserId}", ranked.Count, userId);

                return _mapper.Map<IEnumerable<MedicineDto>>(ranked);
            }

            var allMedicines = await _unitOfWork.Medicines.GetAllAsync(cancellationToken);

            var fuzzyMatches = allMedicines
                .Where(m => !string.IsNullOrWhiteSpace(m.Name))
                .Select(m => new
                {
                    Medicine = m,
                    Score = _jaro.Similarity(m.Name!.ToLowerInvariant(), normalizedQuery)
                            + (userPurchasedIds.Contains(m.Id) ? PurchasedBoost : 0)
                })
                .Where(x => x.Score >= SimilarityThreshold)
                .OrderByDescending(x => x.Score)
                .Take(top)
                .Select(x => x.Medicine)
                .ToList();

            _logger.LogInformation("Fuzzy search returned {Count} results for query '{Query}' with threshold {Threshold}", fuzzyMatches.Count, query, SimilarityThreshold);
            
            return _mapper.Map<IEnumerable<MedicineDto>>(fuzzyMatches);
        }
    }
}
