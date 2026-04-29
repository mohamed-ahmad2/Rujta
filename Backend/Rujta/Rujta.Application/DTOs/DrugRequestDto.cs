using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Rujta.Application.DTOs
{
    
        public class CreateDrugRequestDto
        {
            [Required, MaxLength(200)]
            public string DrugName { get; set; } = string.Empty;

            [MaxLength(1000)]
            public string Description { get; set; } = string.Empty;

            [Required, MaxLength(100)]
            public string Category { get; set; } = string.Empty;

            [Required, MaxLength(200)]
            public string Manufacturer { get; set; } = string.Empty;

            [MaxLength(200)]
            public string Supplier { get; set; } = string.Empty;

            [Range(0.01, double.MaxValue, ErrorMessage = "Price must be greater than 0")]
            public decimal Price { get; set; }

            [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
            public int Quantity { get; set; }

            [Required]
            public DateTime ExpiryDate { get; set; }
        }

        // ── Super admin approve/reject ───────────────────────────────
        public class ReviewDrugRequestDto
        {
            [Required]
            public bool Approved { get; set; }

            // Required only when rejecting
            [MaxLength(500)]
            public string? RejectionReason { get; set; }
        }

        // ── Response shape (both roles see this) ────────────────────
        public class DrugRequestDto
        {
            public int Id { get; set; }
            public int PharmacyId { get; set; }
            public string SubmittedByUserId { get; set; } = string.Empty;

            public string DrugName { get; set; } = string.Empty;
            public string Description { get; set; } = string.Empty;
            public string Category { get; set; } = string.Empty;
            public string Manufacturer { get; set; } = string.Empty;
            public string Supplier { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public int Quantity { get; set; }
            public DateTime ExpiryDate { get; set; }

            public string Status { get; set; } = string.Empty;
            public string? ReviewedByAdminId { get; set; }
            public string? RejectionReason { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? ReviewedAt { get; set; }
        }
    }

