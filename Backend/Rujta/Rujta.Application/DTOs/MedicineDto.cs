using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    public class MedicineDto : BaseEntityDto
    {
        
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Dosage { get; set; }

        public decimal Price { get; set; }

        public DateTime ExpiryDate { get; set; }

        public string? CompanyName { get; set; }
        public int? CategoryId { get; set; }
        public string? ActiveIngredient { get; set; }
        public string? ImageUrl { get; set; }
    }
}
