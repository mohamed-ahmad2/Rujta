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
                var existingUser = await _userManager.FindByEmailAsync(dto.AdminEmail);
                if (existingUser != null)
                    throw new InvalidOperationException("Admin email already exists.");

                var admin = new Admin
                {
                    Id = Guid.NewGuid(),
                    Name = dto.AdminName,
                    Email = dto.AdminEmail,
                    PhoneNumber = dto.AdminPhone,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.People.AddAsync(admin, cancellationToken);

                var generatedPassword = GenerateStrongPassword();

                var identityUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = dto.AdminEmail,
                    Email = dto.AdminEmail,
                    FullName = dto.AdminName,
                    DomainPersonId = admin.Id,
                    Location = dto.PharmacyLocation
                };

                var result = await _userManager.CreateAsync(identityUser, generatedPassword);
                if (!result.Succeeded)
                    throw new InvalidOperationException(string.Join(", ", result.Errors.Select(e => e.Description)));

                await _userManager.AddToRoleAsync(identityUser, "PharmacyAdmin");

                var pharmacy = new Pharmacy
                {
                    Name = dto.PharmacyName,
                    Location = dto.PharmacyLocation,
                    ContactNumber = dto.AdminPhone,
                    OpenHours = "9AM - 11PM",
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    IsActive = true,
                    AdminId = admin.Id
                };
                await _unitOfWork.Pharmacies.AddAsync(pharmacy, cancellationToken);

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
            var pharmacies = await _unitOfWork.Pharmacies.GetAllPharmacies(cancellationToken);

            return pharmacies.Select(p => new PharmacyDto
            {
                Id = p.Id,
                Name = p.Name,
                Location = p.Location,
                ContactNumber = p.ContactNumber,
                Latitude = p.Latitude,
                Longitude = p.Longitude,
                IsActive = p.IsActive,
                AdminId = p.AdminId
            });
        }

        // ================= GET PHARMACY BY ID =================
        public async Task<PharmacyDto?> GetPharmacyByIdAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null) return null;

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

        // ================= UPDATE PHARMACY =================
        public async Task<PharmacyDto> UpdatePharmacyAsync(int pharmacyId, UpdatePharmacyDto dto, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

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
    }
}
