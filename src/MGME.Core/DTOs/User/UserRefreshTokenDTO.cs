using System.Collections.Generic;

using MGME.Core.Entities;

namespace MGME.Core.DTOs.User
{
    public class UserRefreshTokenDTO : BaseEntityDTO
    {
        public ICollection<RefreshToken> RefreshTokens { get; set; }
    }
}