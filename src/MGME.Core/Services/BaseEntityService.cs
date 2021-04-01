using System.Security.Claims;

using Microsoft.AspNetCore.Http;

namespace MGME.Core.Services
{
    public class BaseEntityService
    {
        protected readonly IHttpContextAccessor _httpContextAccessor;

        public BaseEntityService(IHttpContextAccessor httpContextAcessor)
        {
            _httpContextAccessor = httpContextAcessor;
        }

        protected int GetUserIdFromHttpContext()
        {
            return int.Parse(
                _httpContextAccessor.HttpContext.User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                )
            );
        }

        protected string GetUserRoleFromHttpContext()
        {
            return _httpContextAccessor.HttpContext.User.FindFirstValue(
                    ClaimTypes.Role
            );
        }
    }
}