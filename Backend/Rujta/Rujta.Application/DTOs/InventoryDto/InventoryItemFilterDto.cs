namespace Rujta.Application.DTOs.InventoryDto
{
    public class InventoryItemFilterDto
    {
        private const int MaxPageSize = 100;
        private int _pageSize = 16;

        public int? MedicineId { get; set; }
        public int? CategoryId { get; set; }
        public ProductStatus? Status { get; set; }

        public int PageNumber { get; set; } = 1;

        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value switch
            {
                > MaxPageSize => MaxPageSize,
                < 1 => 16,
                _ => value
            };
        }
    }
}
