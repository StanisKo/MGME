using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;

namespace MGME.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task <DataServiceResponse<UserLoginResponseDTO>> LoginUser(string name, string password);

        Task <BaseServiceResponse> RegisterUser(string name, string email, string password);

        Task <BaseServiceResponse> ConfirmEmailAddress(string token);
    }
}