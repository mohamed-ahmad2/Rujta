namespace Rujta.Infrastructure.Constants
{
    public static class AuthMessages
    {
        public const string UnknownUser = "UnknownUser";
        public const string RefreshTokenNotExist = "refreshToken not exist in cookies";
        public const string UserNotFoundInToken = "User not found in token.";
        public const string InvalidUserIdInToken = "Invalid user ID in token.";
        public const string UnknownRole = "Unknown role";
        public const string DeviceIdRequired = "DeviceId is required for generating new tokens.";
        public const string UserNotFound = "User not found";
        public const string HttpContextIsNull = "HttpContext is null";
        public const string RefreshTokenRequired = "Refresh token is required.";
        public const string InvalidOrExpiredRefreshToken = "Invalid or expired refresh token.";
    }
}
