public class AdDto
{
    public int Id { get; set; }
    public int PharmacyId { get; set; }
    public string TemplateName { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string AdMode { get; set; } = "medicine";
    public int? MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? MedicineImage { get; set; }
    public string? Category { get; set; }
    public string Headline { get; set; } = string.Empty;
    public string Subtext { get; set; } = string.Empty;
    public string CtaLabel { get; set; } = string.Empty;
    public string ColorFrom { get; set; } = "#0ea5e9";
    public string ColorTo { get; set; } = "#0369a1";
    public string ColorAccent { get; set; } = "#38bdf8";
    public string FontLabel { get; set; } = "Modern Sans";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }

  
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public DateTime? StartsAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
}