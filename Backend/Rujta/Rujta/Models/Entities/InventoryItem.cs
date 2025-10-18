﻿using Rujta.Models.Common;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Rujta.Models.Entities
{
    public class InventoryItem : BaseEntity
    {
        [ForeignKey("Pharmacy")]
        public int PharmacyID { get; set; }

        [ForeignKey("Medicine")]
        public int MedicineID { get; set; }

        [ForeignKey("Prescription")]
        public int? PrescriptionID { get; set; }

        public int Quantity { get; set; }

        public DateTime ExpiryDate { get; set; }

        public decimal Price { get; set; }

        public bool IsDispensed { get; set; }

        public required virtual Pharmacy Pharmacy { get; set; }
        public required virtual Medicine Medicine { get; set; }
        public virtual Prescription? Prescription { get; set; }
    }
}
