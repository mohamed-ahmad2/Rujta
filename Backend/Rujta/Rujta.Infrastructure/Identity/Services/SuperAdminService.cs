using Rujta.Application.DTOs.CustomerDtos;
using Rujta.Application.DTOs.PharmacyDto;
using Rujta.Application.DTOs.PharmacyDtos;

namespace Rujta.Infrastructure.Identity.Services
{
    public class SuperAdminService : ISuperAdminService
    {
        private const string DefaultOpenHours = "9AM - 11PM";

        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<SuperAdminService> _logger;
        private readonly IMapper _mapper;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IAddressResolver _addressResolver;

        public SuperAdminService(
            IUnitOfWork unitOfWork,
            UserManager<ApplicationUser> userManager,
            ILogger<SuperAdminService> logger,
            IMapper mapper,
            IHttpContextAccessor httpContextAccessor,
            IAddressResolver addressResolver)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _mapper = mapper;
            _httpContextAccessor = httpContextAccessor
                ?? throw new ArgumentNullException(nameof(httpContextAccessor));
            _addressResolver = addressResolver
                ?? throw new ArgumentNullException(nameof(addressResolver));
        }


        public async Task<CreatePharmacyResultDto> CreatePharmacyAsync(
            CreatePharmacyDto dto,
            Guid adminId,
            CancellationToken cancellationToken = default)
        {
            await EnsureManagerEmailIsUniqueAsync(dto.ManagerEmail);

            return await _unitOfWork.ExecuteInTransactionAsync(async ct =>
            {
                var effectiveAdminId = await ResolveEffectiveAdminIdAsync(
                    dto.ParentPharmacyId, adminId, ct);

                await EnsureAdminExistsAsync(effectiveAdminId, ct);


                var manager = CreateManagerEntity(dto, effectiveAdminId);
                await _unitOfWork.People.AddAsync(manager, ct);


                var generatedPassword = GenerateStrongPassword();
                await CreateIdentityUserAsync(dto, manager.Id, generatedPassword);


                var imageUrl = await SaveImageAsync(dto.Image, ct);


                await _addressResolver.ResolveAsync(dto.Address);


                var address = _mapper.Map<Address>(dto.Address);
                await _unitOfWork.Address.AddAsync(address, ct);
                await _unitOfWork.SaveAsync(ct);


                var pharmacy = BuildPharmacyEntity(
                    dto, manager.Id, effectiveAdminId, imageUrl, address.Id);

                await _unitOfWork.Pharmacies.AddAsync(pharmacy, ct);
                await _unitOfWork.SaveAsync(ct);


                address.PharmacyId = pharmacy.Id;


                manager.PharmacyId = pharmacy.Id;

                await _unitOfWork.SaveAsync(ct);

                LogPharmacyCreated(dto, effectiveAdminId);

                return new CreatePharmacyResultDto
                {
                    PharmacyId = pharmacy.Id,
                    ManagerId = manager.Id,
                    AdminId = effectiveAdminId,
                    ManagerEmail = dto.ManagerEmail,
                    GeneratedPassword = generatedPassword
                };
            }, cancellationToken);
        }

        private async Task EnsureManagerEmailIsUniqueAsync(string email)
        {
            var existingUser = await _userManager.FindByEmailAsync(email);
            if (existingUser != null)
                throw new InvalidOperationException("Manager email already exists.");
        }

        private async Task<Guid> ResolveEffectiveAdminIdAsync(
            int? parentPharmacyId,
            Guid fallbackAdminId,
            CancellationToken ct)
        {
            if (!parentPharmacyId.HasValue)
                return fallbackAdminId;

            var parentPharmacy = await _unitOfWork.Pharmacies
                .GetByIdAsync(parentPharmacyId.Value, ct);

            ValidateParentPharmacy(parentPharmacy, parentPharmacyId.Value);

            return parentPharmacy!.AdminId ?? fallbackAdminId;
        }

        private static void ValidateParentPharmacy(Pharmacy? parent, int parentId)
        {
            if (parent == null)
                throw new KeyNotFoundException(
                    $"Parent pharmacy with Id {parentId} not found.");

            if (parent.IsDeleted)
                throw new InvalidOperationException(
                    "Cannot create a branch under a deleted pharmacy.");

            if (parent.ParentPharmacyID != null)
                throw new InvalidOperationException(
                    "Cannot create a branch under another branch. Pick a main pharmacy.");
        }

        private async Task EnsureAdminExistsAsync(Guid adminId, CancellationToken ct)
        {
            var admin = await _unitOfWork.People.GetByIdAsync<Admin>(adminId, ct);
            if (admin == null)
                throw new InvalidOperationException($"Admin with Id {adminId} not found.");
        }

        private static Manager CreateManagerEntity(CreatePharmacyDto dto, Guid adminId)
        {
            var now = DateTime.UtcNow;
            return new Manager
            {
                Id = Guid.NewGuid(),
                Name = dto.ManagerName,
                Email = dto.ManagerEmail,
                PhoneNumber = dto.ManagerPhone,
                Qualification = dto.ManagerQualification,
                ExperienceYears = dto.ManagerExperienceYears,
                WorkStartTime = TimeSpan.FromHours(9),
                WorkEndTime = TimeSpan.FromHours(23),
                StartDate = now,
                AdminId = adminId,
                CreatedAt = now
            };
        }

        private async Task CreateIdentityUserAsync(
            CreatePharmacyDto dto,
            Guid domainPersonId,
            string password)
        {
            var identityUser = new ApplicationUser
            {
                Id = Guid.NewGuid(),
                UserName = dto.ManagerEmail,
                Email = dto.ManagerEmail,
                PhoneNumber = dto.ManagerPhone,
                FullName = dto.ManagerName,
                DomainPersonId = domainPersonId,
                Location = BuildLocationString(dto.Address),
                IsFirstLogin = true,
                EmailConfirmed = true
            };

            var createResult = await _userManager.CreateAsync(identityUser, password);
            if (!createResult.Succeeded)
                throw new InvalidOperationException(
                    string.Join(", ", createResult.Errors.Select(e => e.Description)));

            await _userManager.AddToRoleAsync(identityUser, nameof(UserRole.PharmacyAdmin));
        }

        private static Pharmacy BuildPharmacyEntity(
            CreatePharmacyDto dto,
            Guid managerId,
            Guid adminId,
            string? imageUrl,
            int addressId)
        {
            return new Pharmacy
            {
                Name = dto.PharmacyName,
                ContactNumber = dto.ManagerPhone,
                OpenHours = string.IsNullOrWhiteSpace(dto.OpenHours) ? DefaultOpenHours : dto.OpenHours,
                AddressId = addressId,
                IsActive = true,
                IsDeleted = false,
                ImageUrl = imageUrl,
                ManagerId = managerId,
                AdminId = adminId,
                ParentPharmacyID = dto.ParentPharmacyId
            };
        }

        private void LogPharmacyCreated(CreatePharmacyDto dto, Guid adminId)
        {
            var pharmacyType = dto.ParentPharmacyId.HasValue ? "Branch" : "Main Pharmacy";
            _logger.LogInformation(
                "{Type} '{Name}' created with Manager {Manager} by Admin {Admin}. ParentId={ParentId}",
                pharmacyType, dto.PharmacyName, dto.ManagerEmail, adminId, dto.ParentPharmacyId);
        }

        public async Task<IEnumerable<PharmacyDto>> GetAllPharmaciesAsync(
            CancellationToken cancellationToken = default)
        {
            var pharmacies = (await _unitOfWork.Pharmacies
                                .GetAllWithIncludesAsync(cancellationToken,
                                    p => p.Manager!,
                                    p => p.Admin!,
                                    p => p.Address!,
                                    p => p.ParentPharmacy!,
                                    p => p.Branches))
                                .Where(p => !p.IsDeleted)
                                .ToList();

            var dtos = _mapper.Map<List<PharmacyDto>>(pharmacies);

            foreach (var dto in dtos)
            {
                dto.ImageUrl = EnsureAbsoluteUrl(dto.ImageUrl);
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
                    p => p.Address!,
                    p => p.ParentPharmacy!,
                    p => p.Branches);

            if (pharmacy == null || pharmacy.IsDeleted)
                return null;

            var dto = _mapper.Map<PharmacyDto>(pharmacy);
            dto.ImageUrl = EnsureAbsoluteUrl(dto.ImageUrl);
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
                    p => p.Address!,
                    p => p.ParentPharmacy!,
                    p => p.Branches);

            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            if (pharmacy.IsDeleted)
                throw new InvalidOperationException("Cannot update a deleted pharmacy.");


            pharmacy.Name = dto.Name;
            pharmacy.ContactNumber = dto.ContactNumber;
            if (!string.IsNullOrWhiteSpace(dto.OpenHours))
                pharmacy.OpenHours = dto.OpenHours;


            await _addressResolver.ResolveAsync(dto.Address);


            if (pharmacy.Address == null)
            {
                var newAddress = _mapper.Map<Address>(dto.Address);
                newAddress.PharmacyId = pharmacy.Id;

                await _unitOfWork.Address.AddAsync(newAddress, cancellationToken);
                await _unitOfWork.SaveAsync(cancellationToken);

                pharmacy.AddressId = newAddress.Id;
            }
            else
            {
                _mapper.Map(dto.Address, pharmacy.Address);
            }

            await _unitOfWork.SaveAsync(cancellationToken);

            var result = _mapper.Map<PharmacyDto>(pharmacy);
            result.ImageUrl = EnsureAbsoluteUrl(result.ImageUrl);
            return result;
        }

        public async Task<string> ResetPharmacyManagerPasswordAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
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
            int pharmacyId,
            CancellationToken cancellationToken = default)
        {
            var pharmacy = await _unitOfWork.Pharmacies.GetByIdAsync(pharmacyId, cancellationToken);
            if (pharmacy == null)
                throw new KeyNotFoundException("Pharmacy not found.");

            return await _unitOfWork.SuperAdmin.GetTotalOrdersAsync(pharmacyId, cancellationToken);
        }

        public Task<List<PharmacyStatsDto>> GetTopPharmaciesAsync(
            int count,
            CancellationToken cancellationToken = default)
            => _unitOfWork.SuperAdmin.GetTopPharmaciesAsync(count, cancellationToken);

        public async Task<bool> DeletePharmacyAsync(
            int pharmacyId,
            CancellationToken cancellationToken = default)
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

        public async Task<IEnumerable<PharmacyDto>> GetMainPharmaciesAsync(CancellationToken cancellationToken = default)
        {
            var mains = (await _unitOfWork.Pharmacies
                .GetAllWithIncludesAsync(cancellationToken,
                    p => p.Manager!,
                    p => p.Admin!,
                    p => p.Address!,
                    p => p.Branches))
                .Where(p => !p.IsDeleted && p.ParentPharmacyID == null)
                .ToList();

            var dtos = _mapper.Map<List<PharmacyDto>>(mains);

            foreach (var dto in dtos)
            {
                dto.ImageUrl = EnsureAbsoluteUrl(dto.ImageUrl);

                dto.TotalOrders = await _unitOfWork.SuperAdmin
                    .GetTotalOrdersAsync(dto.Id, cancellationToken);

                dto.BranchesCount = await _unitOfWork.Pharmacies
                    .CountBranchesAsync(dto.Id, cancellationToken);
            }

            return dtos;
        }

        public async Task<IEnumerable<BranchDto>> GetBranchesAsync(int parentId, CancellationToken cancellationToken = default)
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

        public async Task<PharmacyTreeDto?> GetPharmacyTreeAsync(int rootId, CancellationToken cancellationToken = default)
        {
            var root = await _unitOfWork.Pharmacies
                .GetByIdWithIncludesAsync(rootId, cancellationToken,
                    p => p.Manager!,
                    p => p.Address!,
                    p => p.Branches);

            if (root == null || root.IsDeleted) return null;

            var branches = await _unitOfWork.Pharmacies
                .GetBranchesAsync(rootId, cancellationToken);

            root.Branches = branches;

            return _mapper.Map<PharmacyTreeDto>(root);
        }

        public async Task<bool> DetachBranchAsync(int branchId, CancellationToken cancellationToken = default)
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

        public async Task<bool> AttachBranchAsync(int branchId, int parentId, CancellationToken cancellationToken = default)
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

        private string BuildAbsoluteUrl(string relativePath)
        {
            var request = _httpContextAccessor.HttpContext?.Request;
            if (request == null)
                return relativePath;

            return $"{request.Scheme}://{request.Host}{relativePath}";
        }

        private string? EnsureAbsoluteUrl(string? url)
        {
            if (string.IsNullOrWhiteSpace(url)) return url;

            if (url.StartsWith("http://") || url.StartsWith("https://"))
                return url;

            return BuildAbsoluteUrl(url.StartsWith('/') ? url : $"/{url}");
        }

        private static string GenerateStrongPassword()
            => "Ph@" + Guid.NewGuid().ToString("N")[..8] + "1!";

        private static string BuildLocationString(AddressDto? addr)
        {
            if (addr == null) return "Not provided";

            var parts = new List<string>();
            if (!string.IsNullOrWhiteSpace(addr.Street)) parts.Add(addr.Street.Trim());
            if (!string.IsNullOrWhiteSpace(addr.BuildingNo)) parts.Add($"Building {addr.BuildingNo.Trim()}");
            if (!string.IsNullOrWhiteSpace(addr.City)) parts.Add(addr.City.Trim());
            if (!string.IsNullOrWhiteSpace(addr.Governorate)) parts.Add(addr.Governorate.Trim());

            return parts.Count == 0 ? "Not provided" : string.Join(", ", parts);
        }
    }
}