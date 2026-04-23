using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Rujta.Application.DTOs;
using Rujta.Application.DTOs.Rujta.Application.DTOs;
using Rujta.Application.Interfaces.InterfaceServices;
using Rujta.Domain.Entities;
using Rujta.Infrastructure.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace Rujta.Infrastructure.Identity.Services
{
    public class SuperAdminService : ISuperAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<SuperAdminService> _logger;

        public SuperAdminService(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<SuperAdminService> logger)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger;
        }

        // ================= CREATE PHARMACY =================
        public async Task<CreatePharmacyResultDto> CreatePharmacyAsync(CreatePharmacyDto dto, CancellationToken cancellationToken = default)
        {
            await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
                // ================= CHECK EXISTING ADMIN =================
                var existingUser = await _userManager.FindByEmailAsync(dto.AdminEmail);
                if (existingUser != null)
                    throw new InvalidOperationException("Admin email already exists.");

                // ================= CREATE ADMIN =================
                var admin = new Admin
                {
                    Id = Guid.NewGuid(),
                    Name = dto.AdminName,
                    Email = dto.AdminEmail,
                    PhoneNumber = dto.AdminPhone,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.People.AddAsync(admin, cancellationToken);

                // ================= CREATE IDENTITY USER =================
                var generatedPassword = GenerateStrongPassword();

                var identityUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = dto.AdminEmail,
                    Email = dto.AdminEmail,
                    FullName = dto.AdminName,
                    DomainPersonId = admin.Id,
                    Location = dto.PharmacyLocation,
                    IsFirstLogin = true
                };

                var result = await _userManager.CreateAsync(identityUser, generatedPassword);
                if (!result.Succeeded)
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

                await _userManager.AddToRoleAsync(identityUser, "PharmacyAdmin");

                // ================= HANDLE IMAGE UPLOAD =================
                string? imageUrl = null;

                if (dto.Image != null)
                {
                    var folderPath = Path.Combine("wwwroot", "images", "pharmacies");

                    // تأكد إن الفولدر موجود
                    if (!Directory.Exists(folderPath))
                        Directory.CreateDirectory(folderPath);

                    var fileName = Guid.NewGuid().ToString() + Path.GetExtension(dto.Image.FileName);
                    var filePath = Path.Combine(folderPath, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(stream, cancellationToken);
                    }

                    imageUrl = $"/images/pharmacies/{fileName}";
                }

                // ================= CREATE PHARMACY =================
                var pharmacy = new Pharmacy
                {
                    Name = dto.PharmacyName,
                    Location = dto.PharmacyLocation,
                    ContactNumber = dto.AdminPhone,
                    OpenHours = "9AM - 11PM",
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    IsActive = true,
                    AdminId = admin.Id,
                    ImageUrl = imageUrl, // 🔥 NEW
                    IsDeleted = false
                };

                await _unitOfWork.Pharmacies.AddAsync(pharmacy, cancellationToken);

                // ================= SAVE =================
                await _unitOfWork.SaveAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation("Pharmacy created successfully with Admin {Email}", dto.AdminEmail);

                return new CreatePharmacyResultDto
                {
                    PharmacyId = pharmacy.Id,
                    AdminEmail = dto.AdminEmail,
                    GeneratedPassword = generatedPassword
                };
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        // ================= GET ALL PHARMACIES =================
        public async Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(CancellationToken cancellationToken = default)
        {
            var pharmacies = (await _unitOfWork.Pharmacies.GetAllAsync(cancellationToken))
                                .Where(p => !p.IsDeleted);
            var result = new List<PharmacyDto>();

            foreach (var p in pharmacies)
            {
                var totalOrders = await _unitOfWork.SuperAdmin.GetTotalOrdersAsync(p.Id, cancellationToken);

                result.Add(new PharmacyDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Location = p.Location,
                    ContactNumber = p.ContactNumber,
                    Latitude = p.Latitude,
                    Longitude = p.Longitude,
                    IsActive = p.IsActive,
                    AdminId = p.AdminId,
                    TotalOrders = totalOrders, // 🔥 لو ضفتها في DTO
                    ImageUrl = p.ImageUrl
                });
            }

            return result;
        }

        // ================= GET PHARMACY BY ID =================
        public async Task<PharmacyDto?> GetPharmacyByIdAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null || pharmacy.IsDeleted)
                return null;

            return new PharmacyDto
            {
                Id = pharmacy.Id,
                Name = pharmacy.Name,
                Location = pharmacy.Location,
                ContactNumber = pharmacy.ContactNumber,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                IsActive = pharmacy.IsActive,
                AdminId = pharmacy.AdminId,
                ImageUrl = pharmacy.ImageUrl
            };
        }

        // ================= UPDATE PHARMACY =================
        public async Task<PharmacyDto> UpdatePharmacyAsync(int pharmacyId, UpdatePharmacyDto dto, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");
            if (pharmacy.IsDeleted)
                throw new Exception("Cannot update deleted pharmacy");

            pharmacy.Name = dto.Name;
            pharmacy.Location = dto.Location;
            pharmacy.ContactNumber = dto.ContactNumber;
            pharmacy.Latitude = dto.Latitude;
            pharmacy.Longitude = dto.Longitude;

            await _unitOfWork.SaveAsync(cancellationToken);

            return new PharmacyDto
            {
                Id = pharmacy.Id,
                Name = pharmacy.Name,
                Location = pharmacy.Location,
                ContactNumber = pharmacy.ContactNumber,
                Latitude = pharmacy.Latitude,
                Longitude = pharmacy.Longitude,
                IsActive = pharmacy.IsActive,
                AdminId = pharmacy.AdminId
            };
        }

        // ================= RESET PHARMACY ADMIN PASSWORD =================
        public async Task<string> ResetPharmacyAdminPasswordAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            var adminUser = await _userManager.Users
                .FirstOrDefaultAsync(u => u.DomainPersonId == pharmacy.AdminId, cancellationToken);

            if (adminUser == null)
                throw new KeyNotFoundException("Admin user not found.");

            var newPassword = GenerateStrongPassword();

            var token = await _userManager.GeneratePasswordResetTokenAsync(adminUser);
            var result = await _userManager.ResetPasswordAsync(adminUser, token, newPassword);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

            return newPassword;
        }

        // ================= HELPER: GENERATE STRONG PASSWORD =================
        private static string GenerateStrongPassword()
        {
            return "Ph@" + Guid.NewGuid().ToString("N")[..8] + "1!";
        }
        public async Task<int> GetPharmacyTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            return await _unitOfWork.SuperAdmin.GetTotalOrdersAsync(pharmacyId, cancellationToken);
        }
        public async Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(int count, CancellationToken cancellationToken = default)
        {
            return await _unitOfWork.SuperAdmin
                .GetTopPharmaciesAsync(count, cancellationToken);
        }
        public async Task<bool> DeletePharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (pharmacy.IsDeleted)
                throw new InvalidOperationException("Pharmacy already deleted.");

            // 🔥 Soft Delete
            pharmacy.IsDeleted = true;

            await _unitOfWork.SaveAsync(cancellationToken);

            _logger.LogInformation("Pharmacy {Id} set to IsDeleted", pharmacyId);

            return true;
        }
        public async Task<bool> RestorePharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            // لو مش محذوفة أصلاً
            if (!pharmacy.IsDeleted)
                throw new InvalidOperationException("Pharmacy is already active.");

            // 🔥 Restore
            pharmacy.IsDeleted = false;

            await _unitOfWork.SaveAsync(cancellationToken);

            return true;
        }
    }
}
