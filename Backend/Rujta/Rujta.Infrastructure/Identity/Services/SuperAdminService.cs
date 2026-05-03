using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.PharmacyDtos;
using Rujta.Application.DTOs.Rujta.Application.DTOs;

namespace Rujta.Infrastructure.Identity.Services
{
    public class SuperAdminService : ISuperAdminService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<SuperAdminService> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public SuperAdminService(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<SuperAdminService> logger,
            IHttpContextAccessor httpContextAccessor)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
        }


        public async Task<CreatePharmacyResultDto> CreatePharmacyAsync(
            CreatePharmacyDto dto,
            CancellationToken cancellationToken = default)
        {
            await using var transaction = await _unitOfWork.BeginTransactionAsync(cancellationToken);

            try
            {
            
                var existingUser = await _userManager.FindByEmailAsync(dto.ManagerEmail);
                if (existingUser != null)
                    throw new InvalidOperationException("Manager email already exists.");

             
                Guid? adminId = dto.AdminId ?? await GetCurrentAdminIdAsync();

                Admin? admin = null;
                if (adminId.HasValue)
                {
                    admin = await _unitOfWork.People.GetByIdAsync<Admin>(adminId.Value, cancellationToken);
                    if (admin == null)
                        throw new InvalidOperationException(
                            $"Admin with Id {adminId} not found. The site admin must exist before creating a pharmacy.");
                }
                else
                {
                    throw new InvalidOperationException(
                        "AdminId is required. A site admin must be assigned to the pharmacy.");
                }

             
                var manager = new Manager
                {
                    Id = Guid.NewGuid(),
                    Name = dto.ManagerName,
                    Email = dto.ManagerEmail,
                    PhoneNumber = dto.ManagerPhone,
                    Qualification = dto.ManagerQualification,
                    ExperienceYears = dto.ManagerExperienceYears,
                    WorkStartTime = TimeSpan.FromHours(9),
                    WorkEndTime = TimeSpan.FromHours(23),
                    StartDate = DateTime.UtcNow,
                    EndDate = null,
                    AdminId = adminId,      
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.People.AddAsync(manager, cancellationToken);

           
                var generatedPassword = GenerateStrongPassword();

                var identityUser = new ApplicationUser
                {
                    Id = Guid.NewGuid(),
                    UserName = dto.ManagerEmail,
                    Email = dto.ManagerEmail,
                    PhoneNumber = dto.ManagerPhone,
                    FullName = dto.ManagerName,
                    DomainPersonId = manager.Id,
                    Location = dto.PharmacyLocation,
                    IsFirstLogin = true,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(identityUser, generatedPassword);
                if (!result.Succeeded)
                    throw new InvalidOperationException(
                        string.Join(", ", result.Errors.Select(e => e.Description)));

              
                await _userManager.AddToRoleAsync(identityUser, "PharmacyManager");

             
                string? imageUrl = await SaveImageAsync(dto.Image, cancellationToken);

          
                var pharmacy = new Pharmacy
                {
                    Name = dto.PharmacyName,
                    Location = dto.PharmacyLocation,
                    ContactNumber = dto.ManagerPhone,   
                    OpenHours = string.IsNullOrWhiteSpace(dto.OpenHours) ? "9AM - 11PM" : dto.OpenHours,
                    Latitude = dto.Latitude,
                    Longitude = dto.Longitude,
                    IsActive = true,
                    IsDeleted = false,
                    ImageUrl = imageUrl,

                    ManagerId = manager.Id,  
                    AdminId = adminId        
                };

                await _unitOfWork.Pharmacies.AddAsync(pharmacy, cancellationToken);

            
                manager.PharmacyId = pharmacy.Id;

    
                await _unitOfWork.SaveAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                _logger.LogInformation(
                    "Pharmacy '{Pharmacy}' created with Manager {Manager} under Admin {Admin}",
                    dto.PharmacyName, dto.ManagerEmail, adminId);

                return new CreatePharmacyResultDto
                {
                    PharmacyId = pharmacy.Id,
                    ManagerId = manager.Id,
                    AdminId = adminId,
                    ManagerEmail = dto.ManagerEmail,
                    GeneratedPassword = generatedPassword
                };
            }
            catch
            {
                await transaction.RollbackAsync(cancellationToken);
                throw;
            }
        }

        public async Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(
            CancellationToken cancellationToken = default)
        {
            var pharmacies = (await _unitOfWork.Pharmacies
                                .GetAllWithIncludesAsync(cancellationToken,
                                    p => p.Manager!,
                                    p => p.Admin!))
                                .Where(p => !p.IsDeleted);

            var list = new List<PharmacyDto>();

            foreach (var p in pharmacies)
            {
                var totalOrders = await _unitOfWork.SuperAdmin
                    .GetTotalOrdersAsync(p.Id, cancellationToken);

                list.Add(MapToDto(p, totalOrders));
            }

            return list;
        }

        public async Task<PharmacyDto?> GetPharmacyByIdAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies
                .GetByIdWithIncludesAsync(pharmacyId, cancellationToken,
                    p => p.Manager!,
                    p => p.Admin!);

            if (pharmacy == null || pharmacy.IsDeleted)
                return null;

            var totalOrders = await _unitOfWork.SuperAdmin
                .GetTotalOrdersAsync(pharmacy.Id, cancellationToken);

            return MapToDto(pharmacy, totalOrders);
        }

        public async Task<PharmacyDto> UpdatePharmacyAsync(
            int pharmacyId,
            UpdatePharmacyDto dto,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdWithIncludesAsync(pharmacyId, cancellationToken,
                    p => p.Manager!,
                    p => p.Admin!);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (pharmacy.IsDeleted)
                throw new InvalidOperationException("Cannot update a deleted pharmacy.");

            pharmacy.Name = dto.Name;
            pharmacy.Location = dto.Location;
            pharmacy.ContactNumber = dto.ContactNumber;
            pharmacy.Latitude = dto.Latitude;
            pharmacy.Longitude = dto.Longitude;

            await _unitOfWork.SaveAsync(cancellationToken);

            return MapToDto(pharmacy, 0);
        }


        public async Task<string> ResetPharmacyManagerPasswordAsync(int pharmacyId,CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (pharmacy.ManagerId == null)
                throw new InvalidOperationException("This pharmacy has no manager assigned.");

            var managerUser = await _userManager.Users
                .FirstOrDefaultAsync(u => u.DomainPersonId == pharmacy.ManagerId, cancellationToken);

            if (managerUser == null)
                throw new KeyNotFoundException("Manager user not found.");

            var newPassword = GenerateStrongPassword();
            var token = await _userManager.GeneratePasswordResetTokenAsync(managerUser);
            var result = await _userManager.ResetPasswordAsync(managerUser, token, newPassword);

            if (!result.Succeeded)
                throw new InvalidOperationException(
                    string.Join(", ", result.Errors.Select(e => e.Description)));

            managerUser.IsFirstLogin = true;
            await _userManager.UpdateAsync(managerUser);

            return newPassword;
        }

        public async Task<int> GetPharmacyTotalOrdersAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            return await _unitOfWork.SuperAdmin.GetTotalOrdersAsync(pharmacyId, cancellationToken);
        }

        public Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(
            int count, CancellationToken cancellationToken = default)
            => _unitOfWork.SuperAdmin.GetTopPharmaciesAsync(count, cancellationToken);


        public async Task<bool> DeletePharmacyAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (pharmacy.IsDeleted)
                throw new InvalidOperationException("Pharmacy is already deleted.");

            pharmacy.IsDeleted = true;
            pharmacy.IsActive = false;

            await _unitOfWork.SaveAsync(cancellationToken);
            _logger.LogInformation("Pharmacy {Id} soft-deleted", pharmacyId);
            return true;
        }

        public async Task<bool> RestorePharmacyAsync(int pharmacyId, CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (!pharmacy.IsDeleted)
                throw new InvalidOperationException("Pharmacy is already active.");

            pharmacy.IsDeleted = false;
            pharmacy.IsActive = true;

            await _unitOfWork.SaveAsync(cancellationToken);
            return true;
        }

        private static PharmacyDto MapToDto(Pharmacy p, int totalOrders) => new()
        {
            Id = p.Id,
            Name = p.Name,
            Location = p.Location,
            ContactNumber = p.ContactNumber,
            OpenHours = p.OpenHours,
            Latitude = p.Latitude,
            Longitude = p.Longitude,
            IsActive = p.IsActive,
            IsDeleted = p.IsDeleted,
            ImageUrl = p.ImageUrl,
            TotalOrders = totalOrders,

            AdminId = p.AdminId,
            AdminName = p.Admin?.Name,
            AdminEmail = p.Admin?.Email,

            ManagerId = p.ManagerId,
            ManagerName = p.Manager?.Name,
            ManagerEmail = p.Manager?.Email,
            ManagerPhone = p.Manager?.PhoneNumber
        };

        private async Task<Guid?> GetCurrentAdminIdAsync()
        {
            var principal = _httpContextAccessor.HttpContext?.User;
            if (principal?.Identity?.IsAuthenticated != true) return null;

            var appUser = await _userManager.GetUserAsync(principal);
            return appUser?.DomainPersonId;
        }

        private static async Task<string?> SaveImageAsync(IFormFile? image, CancellationToken ct)
        {
            if (image == null) return null;

            var folderPath = Path.Combine("wwwroot", "images", "pharmacies");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(image.FileName);
            var filePath = Path.Combine(folderPath, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await image.CopyToAsync(stream, ct);

            return $"/images/pharmacies/{fileName}";
        }

        private static string GenerateStrongPassword()
            => "Ph@" + Guid.NewGuid().ToString("N")[..8] + "1!";
    }
}