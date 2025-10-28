using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using System.Text.Json;


namespace Rujta.Application.Services
{
    public class MedicineDataImportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;

        public MedicineDataImportService(IUnitOfWork unitOfWork, HttpClient httpClient)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
        }

        
        public async Task ImportMedicinesAsync(int limit = 10)
        {
            string url = $"https://api.fda.gov/drug/label.json?limit={limit}";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(json);
            var results = doc.RootElement.GetProperty("results");

            foreach (var item in results.EnumerateArray())
            {
                var name = item.TryGetProperty("openfda", out var openfda) &&
                           openfda.TryGetProperty("brand_name", out var brand)
                           ? brand[0].GetString()
                           : "Unknown";

                var ingredient = openfda.TryGetProperty("substance_name", out var substance)
                                 ? substance[0].GetString()
                                 : null;

                var description = item.TryGetProperty("description", out var desc)
                                  ? desc[0].GetString()
                                  : null;

                var dosage = item.TryGetProperty("dosage_and_administration", out var dose)
                             ? dose[0].GetString()
                             : null;

                // Create new entity
                var medicine = new Medicine
                {
                    Name = name ?? "Unknown",
                    ActiveIngredient = ingredient,
                    Description = description,
                    Dosage = dosage,
                    Price = 0, 
                    ExpiryDate = DateTime.UtcNow.AddYears(1) 
                };

                await _unitOfWork.Medicines.AddAsync(medicine);
            }

            await _unitOfWork.SaveAsync();
        }
    }
}
