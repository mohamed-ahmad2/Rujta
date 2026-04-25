namespace Rujta.Application.DTOs.AuthDto
{
    public class ForgotPasswordResponseDto
    {
        public string Message { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }
}
