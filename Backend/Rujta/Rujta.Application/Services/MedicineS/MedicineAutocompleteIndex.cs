using Rujta.Application.Interfaces.InterfaceServices.IMedicine;
using Rujta.Domain.Autocomplete;

namespace Rujta.Application.Services.MedicineS
{
    public class MedicineAutocompleteIndex : IMedicineAutocompleteIndex
    {
        private readonly Trie _trie = new Trie();

        public void Build(IEnumerable<string> medicineNames)
        {
            foreach (var name in medicineNames)
            {
                if (!string.IsNullOrWhiteSpace(name))
                    _trie.Insert(name);
            }
        }

        public List<string> SearchByPrefix(string prefix, int maxResults)
        {
            return _trie.GetWordsByPrefix(prefix, maxResults);
        }
    }
}
