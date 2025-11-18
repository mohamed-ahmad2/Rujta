namespace Rujta.Application.DTOs
{

    public class TokenDto
    {
        public string AccessToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiration { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiration { get; set; }
        public string? AccessTokenJti{ get; set; }
    }
}
