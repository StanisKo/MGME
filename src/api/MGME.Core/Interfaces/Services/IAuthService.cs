using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;

namespace MGME.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task <BaseServiceResponse> RegisterUser(string name, string email, string password);

        Task <DataServiceResponse<UserTokensDTO>> LoginUser(string name, string password);

        Task <BaseServiceResponse> LogoutUser(string token);

        Task <DataServiceResponse<UserTokensDTO>> RefreshAccessToken(string token);

        Task <BaseServiceResponse> ConfirmEmailAddress(string token);
    }
}