namespace Rujta.Infrastructure.Identity.Services.Auth
{
    public partial class AuthService
    {
        public async Task<ForgotPasswordResponseDto> ForgotPasswordAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentNullException(nameof(email));

            var user = await _identity.Identity.UserManager.FindByEmailAsync(email);
            if (user == null)
            {
                _infra.Logger.LogInformation("Forgot password requested for non-existent email: {Email}", email);
                return new ForgotPasswordResponseDto { Message = "If the email exists, an OTP has been sent." };
            }

            string otp = RandomNumberGenerator.GetInt32(100000, 999999).ToString();
            user.PasswordResetToken = otp;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddMinutes(5);
            await _identity.Identity.UserManager.UpdateAsync(user);

            string subject = "Your OTP for Password Reset";
            string body = $"<p>Hello {user.FullName},</p><p>Your OTP is: <strong>{otp}</strong></p><p>Expires in 5 minutes.</p>";
            await _infra.EmailService.SendEmailAsync(email, subject, body);

            _infra.Logger.LogInformation("Forgot password OTP sent to email: {Email}", email);
            return new ForgotPasswordResponseDto { Message = "OTP sent to your email." };
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            if (dto == null) throw new ArgumentNullException(nameof(dto));

            var user = await _identity.Identity.UserManager.FindByEmailAsync(dto.Email);
            if (user == null)
            {
                _infra.Logger.LogWarning("Reset password failed: user not found ({Email})", dto.Email);
                throw new InvalidOperationException("Invalid OTP or email.");
            }

            if (user.PasswordResetToken != dto.Otp || user.PasswordResetTokenExpiry < DateTime.UtcNow)
            {
                _infra.Logger.LogWarning("Reset password failed: invalid or expired OTP for {Email}", dto.Email);
                throw new InvalidOperationException("OTP is invalid or expired.");
            }

            user.PasswordHash = _identity.Identity.UserManager.PasswordHasher.HashPassword(user, dto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _identity.Identity.UserManager.UpdateAsync(user);
            _infra.Logger.LogInformation("Password reset successfully for {Email}", dto.Email);
        }
    }
}
