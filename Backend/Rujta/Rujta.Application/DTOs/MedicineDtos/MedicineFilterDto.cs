namespace Rujta.Application.DTOs.MedicineDtos
{
    public class MedicineFilterDto
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 16;

        public List<int>? CategoryIds { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? CompanyName { get; set; }


        public string? SearchTerm { get; set; }
        public int PageNumber { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set
            {
                if (value > MaxPageSize)
                    _pageSize = MaxPageSize;
                
                else if (value < 1)
                    _pageSize = 16;
                
                else
                    _pageSize = value;
                
            }
        }
    }
}