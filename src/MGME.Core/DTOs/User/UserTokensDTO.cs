using System.Text.Json.Serialization;

namespace MGME.Core.DTOs.User
{
    public class UserTokensDTO
    {
        public string AccessToken { get; set; }

        // So we don't send the refresh token in response, but only via httpOnly cookie
        [JsonIgnore]
        public string RefreshToken { get; set; }
    }
}