namespace Rujta.Application.DTOs.AuthDto
{
    public class LoginResultDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsFirstLogin { get; set; }
    }
}
