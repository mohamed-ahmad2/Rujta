namespace Rujta.Application.Interfaces.InterfaceServices.IMedicine
{
    public interface IMedicineAutocompleteIndex
    {
        void Build(IEnumerable<string> medicineNames);
        List<string> SearchByPrefix(string prefix, int maxResults);
    }

}
