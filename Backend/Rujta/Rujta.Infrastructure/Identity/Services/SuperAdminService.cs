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
        private readonly IMapper _mapper;

        public SuperAdminService(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<SuperAdminService> logger,
            IHttpContextAccessor httpContextAccessor,
            IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _mapper = mapper;
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

                
                Pharmacy? parentPharmacy = null;
                Guid? adminId = dto.AdminId ?? await GetCurrentAdminIdAsync();

                if (dto.ParentPharmacyId.HasValue)
                {
                    parentPharmacy = await _unitOfWork.Pharmacies
                        .GetByIdAsync(dto.ParentPharmacyId.Value, cancellationToken);

                    if (parentPharmacy == null)
                        throw new KeyNotFoundException(
                            $"Parent pharmacy with Id {dto.ParentPharmacyId} not found.");

                    if (parentPharmacy.IsDeleted)
                        throw new InvalidOperationException(
                            "Cannot create a branch under a deleted pharmacy.");

                    if (parentPharmacy.ParentPharmacyID != null)
                        throw new InvalidOperationException(
                            "Cannot create a branch under another branch. Pick a main pharmacy.");

                    
                    adminId = parentPharmacy.AdminId;
                }

                if (!adminId.HasValue)
                    throw new InvalidOperationException(
                        "AdminId is required. A site admin must be assigned to the pharmacy.");

                var admin = await _unitOfWork.People
                    .GetByIdAsync<Admin>(adminId.Value, cancellationToken);
                if (admin == null)
                    throw new InvalidOperationException(
                        $"Admin with Id {adminId} not found.");

              
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
                    AdminId = adminId,
                    ParentPharmacyID = dto.ParentPharmacyId
                };

                await _unitOfWork.Pharmacies.AddAsync(pharmacy, cancellationToken);
                manager.PharmacyId = pharmacy.Id;

                await _unitOfWork.SaveAsync(cancellationToken);
                await transaction.CommitAsync(cancellationToken);

                var pharmacyType = dto.ParentPharmacyId.HasValue ? "Branch" : "Main Pharmacy";
                _logger.LogInformation(
                    "{Type} '{Name}' created with Manager {Manager}. ParentId={ParentId}",
                    pharmacyType, dto.PharmacyName, dto.ManagerEmail, dto.ParentPharmacyId);

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
                                    p => p.Admin!,
                                    p => p.ParentPharmacy!,
                                    p => p.Branches))
                                .Where(p => !p.IsDeleted)
                                .ToList();

     
            var dtos = _mapper.Map<List<PharmacyDto>>(pharmacies);

   
            foreach (var dto in dtos)
            {
                dto.TotalOrders = await _unitOfWork.SuperAdmin
                    .GetTotalOrdersAsync(dto.Id, cancellationToken);
            }

            return dtos;
        }


        public async Task<PharmacyDto?> GetPharmacyByIdAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies
                .GetByIdWithIncludesAsync(pharmacyId, cancellationToken,
                    p => p.Manager!,
                    p => p.Admin!,
                    p => p.ParentPharmacy!,
                    p => p.Branches);

            if (pharmacy == null || pharmacy.IsDeleted)
                return null;

            var dto = _mapper.Map<PharmacyDto>(pharmacy);
            dto.TotalOrders = await _unitOfWork.SuperAdmin
                .GetTotalOrdersAsync(pharmacy.Id, cancellationToken);

            return dto;
        }


        public async Task<PharmacyDto> UpdatePharmacyAsync(
            int pharmacyId,
            UpdatePharmacyDto dto,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies
                .GetByIdWithIncludesAsync(pharmacyId, cancellationToken,
                    p => p.Manager!,
                    p => p.Admin!,
                    p => p.ParentPharmacy!,
                    p => p.Branches);

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

            return _mapper.Map<PharmacyDto>(pharmacy);
        }

 
        public async Task<string> ResetPharmacyManagerPasswordAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
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


        public async Task<int> GetPharmacyTotalOrdersAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
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

   
            var activeBranches = await _unitOfWork.Pharmacies
                .CountBranchesAsync(pharmacyId, cancellationToken);
            if (activeBranches > 0)
                throw new InvalidOperationException(
                    "Cannot delete a main pharmacy that still has active branches. Detach or delete branches first.");

            pharmacy.IsDeleted = true;
            pharmacy.IsActive = false;

            await _unitOfWork.SaveAsync(cancellationToken);
            _logger.LogInformation("Pharmacy {Id} soft-deleted", pharmacyId);
            return true;
        }

        public async Task<bool> RestorePharmacyAsync(
            int pharmacyId, CancellationToken cancellationToken = default)
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


        public async Task<IEnumerable<PharmacyDto>> GetMainPharmaciesAsync(
            CancellationToken cancellationToken = default)
        {
            var mains = await _unitOfWork.Pharmacies.GetMainPharmaciesAsync(cancellationToken);
            var dtos = _mapper.Map<List<PharmacyDto>>(mains);

            foreach (var dto in dtos)
            {
                dto.TotalOrders = await _unitOfWork.SuperAdmin
                    .GetTotalOrdersAsync(dto.Id, cancellationToken);

                dto.BranchesCount = await _unitOfWork.Pharmacies
                    .CountBranchesAsync(dto.Id, cancellationToken);
            }

            return dtos;
        }


        public async Task<IEnumerable<BranchDto>> GetBranchesAsync(
            int parentId, CancellationToken cancellationToken = default)
        {
            var parent = await _unitOfWork.Pharmacies.GetByIdAsync(parentId, cancellationToken);
            if (parent == null)
                throw new KeyNotFoundException("Parent pharmacy not found.");

            if (parent.ParentPharmacyID != null)
                throw new InvalidOperationException(
                    "The provided pharmacy is itself a branch, not a main pharmacy.");

            var branches = await _unitOfWork.Pharmacies
                .GetBranchesAsync(parentId, cancellationToken);

            return _mapper.Map<IEnumerable<BranchDto>>(branches);
        }

        public async Task<PharmacyTreeDto?> GetPharmacyTreeAsync(
            int rootId, CancellationToken cancellationToken = default)
        {
            var root = await _unitOfWork.Pharmacies
                .GetByIdWithIncludesAsync(rootId, cancellationToken,
                    p => p.Manager!,
                    p => p.Branches);

            if (root == null || root.IsDeleted) return null;


            var branches = await _unitOfWork.Pharmacies
                .GetBranchesAsync(rootId, cancellationToken);

      
            root.Branches = branches;

            return _mapper.Map<PharmacyTreeDto>(root);
        }


        public async Task<bool> DetachBranchAsync(
            int branchId, CancellationToken cancellationToken = default)
        {
            var branch = await _unitOfWork.Pharmacies.GetByIdAsync(branchId, cancellationToken);
            if (branch == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (branch.ParentPharmacyID == null)
                throw new InvalidOperationException("This pharmacy is already a main pharmacy.");

            branch.ParentPharmacyID = null;
            await _unitOfWork.SaveAsync(cancellationToken);

            _logger.LogInformation("Branch {Id} detached and is now a main pharmacy", branchId);
            return true;
        }

        public async Task<bool> AttachBranchAsync(
            int branchId, int parentId, CancellationToken cancellationToken = default)
        {
            if (branchId == parentId)
                throw new InvalidOperationException("A pharmacy cannot be a branch of itself.");

            var branch = await _unitOfWork.Pharmacies.GetByIdAsync(branchId, cancellationToken);
            if (branch == null)
                throw new KeyNotFoundException("Branch pharmacy not found.");

            var parent = await _unitOfWork.Pharmacies.GetByIdAsync(parentId, cancellationToken);
            if (parent == null)
                throw new KeyNotFoundException("Parent pharmacy not found.");

            if (parent.ParentPharmacyID != null)
                throw new InvalidOperationException(
                    "The selected parent is itself a branch. Choose a main pharmacy.");

            var hasBranches = await _unitOfWork.Pharmacies
                .CountBranchesAsync(branchId, cancellationToken) > 0;
            if (hasBranches)
                throw new InvalidOperationException(
                    "Cannot attach a pharmacy that already has branches under it.");

            branch.ParentPharmacyID = parentId;
            branch.AdminId = parent.AdminId;

            await _unitOfWork.SaveAsync(cancellationToken);

            _logger.LogInformation(
                "Pharmacy {Branch} attached as branch under {Parent}", branchId, parentId);
            return true;
        }

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