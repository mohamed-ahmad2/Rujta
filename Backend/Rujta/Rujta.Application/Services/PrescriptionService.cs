using Microsoft.Extensions.Configuration;
using Rujta.Application.DTOs.MedicineDtos;
using System.Text.Json;

namespace Rujta.Application.Services
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly HttpClient _http;

        public PrescriptionService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IConfiguration config,
            IHttpClientFactory factory)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _http = factory.CreateClient();
        }

        public async Task<PrescriptionResultDto> AnalyzePrescriptionAsync(
            Stream imageStream,
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var apiKey = Environment.GetEnvironmentVariable("API_KEY");
            if (string.IsNullOrEmpty(apiKey))
            {
                Console.WriteLine("API_KEY NOT FOUND!");
            }
            else
            {
                Console.WriteLine($"API_KEY loaded: {apiKey.Substring(0, 5)}...");
            }

            using var ms = new MemoryStream();
            await imageStream.CopyToAsync(ms);
            var base64 = Convert.ToBase64String(ms.ToArray());

            var body = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new object[]
                        {
                            new {
                                inline_data = new {
                                    mime_type = "image/jpeg",
                                    data = base64
                                }
                            },
                            new {
                                text = @"Extract medicine names from this prescription image whole medicine name and its dosage.
Return ONLY a JSON array of strings like:
[""Panadol 50mg "",""Augmentin""]
No explanation dont get any ting extra stick with the forms i gave u."
                            }
                        }
                    }
                }
            };

            var modelName = "models/gemini-2.5-flash";
            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"https://generativelanguage.googleapis.com/v1/{modelName}:generateContent?key={apiKey}");

            request.Content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            var response = await _http.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            Console.WriteLine(json);

            using var doc = JsonDocument.Parse(json);

            if (!doc.RootElement.TryGetProperty("candidates", out var candidates))
            {
                return new PrescriptionResultDto
                {
                    AvailableMedicines = new(),
                    NotFoundMedicines = new List<string> { "Failed to analyze prescription" }
                };
            }

            var rawText = candidates[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "[]";

            var cleanedText = rawText
                .Replace("```json", "", StringComparison.OrdinalIgnoreCase)
                .Replace("```", "")
                .Trim();

            // ✅ التصحيح: تأمين ضد الـ null باستخدام ?? 
            var medicineNames = JsonSerializer.Deserialize<List<string>>(cleanedText)
                                ?? new List<string>();

            // ✅ إذا القائمة فارغة، ارجع مباشرة
            if (!medicineNames.Any())
            {
                return new PrescriptionResultDto
                {
                    AvailableMedicines = new(),
                    NotFoundMedicines = new List<string> { "No medicines extracted from prescription" }
                };
            }

            var medicines = await _unitOfWork.Medicines
                .FindAsync(m => medicineNames.Contains(m.Name), cancellationToken);

            var result = new PrescriptionResultDto();

            foreach (var med in medicines)
            {
                result.AvailableMedicines.Add(_mapper.Map<MedicineDto>(med));
            }

            result.NotFoundMedicines =
                medicineNames.Except(medicines.Select(m => m.Name)).ToList();

            return result;
        }
    }
}