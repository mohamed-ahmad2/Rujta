using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Rujta.Application.Constants;
using Rujta.Application.Interfaces;
using Rujta.Domain.Entities;
using System.Text.Json;

namespace Rujta.Application.Services
{
    public class MedicineDataImportService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly HttpClient _httpClient;
        private readonly ILogger<MedicineDataImportService> _logger;
        private readonly IConfiguration _configuration;

        public MedicineDataImportService(IUnitOfWork unitOfWork, HttpClient httpClient, ILogger<MedicineDataImportService> logger, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _httpClient = httpClient;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task ImportMedicinesAsync(int limit = 10)
        {
            string url = $"https://api.fda.gov/drug/label.json?limit={limit}";

            try
            {
                _logger.LogInformation("Starting medicine import. Limit: {Limit}", limit);

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

                    var imageUrl = _configuration[$"MedicineSettings:{MedicineKeys.PlaceholderImageUrl}"]
                                        ?? "/images/medicines/default.png";

                    var savedImageUrl = await DownloadAndSaveImageAsync(imageUrl, $"{Guid.NewGuid()}.png")
                                        ?? "/images/medicines/default.png";

                    var medicine = new Medicine
                    {
                        Name = name ?? "Unknown",
                        ActiveIngredient = ingredient,
                        Description = description,
                        Dosage = dosage,
                        Price = 250,
                        ExpiryDate = DateTime.UtcNow.AddYears(1),
                        ImageUrl = savedImageUrl
                    };

                    await _unitOfWork.Medicines.AddAsync(medicine);
                    _logger.LogInformation("Added medicine: {Name}", medicine.Name);
                }

                await _unitOfWork.SaveAsync();
                _logger.LogInformation("Medicine import completed successfully.");
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "HTTP request failed during medicine import.");
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "Failed to parse JSON during medicine import.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during medicine import.");
            }
        }

        private async Task<string?> DownloadAndSaveImageAsync(string imageUrl, string fileName)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                _logger.LogWarning("Image URL is empty. Skipping download.");
                return null;
            }

            var imagesPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "medicines");
            if (!Directory.Exists(imagesPath))
            {
                Directory.CreateDirectory(imagesPath);
                _logger.LogInformation("Created directory for medicine images: {Path}", imagesPath);
            }

            var filePath = Path.Combine(imagesPath, fileName);

            try
            {
                var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
                await File.WriteAllBytesAsync(filePath, imageBytes);
                _logger.LogInformation("Saved image: {FileName}", fileName);
                return $"/images/medicines/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to download or save image from URL: {ImageUrl}", imageUrl);
                return null;
            }
        }
    }
}
