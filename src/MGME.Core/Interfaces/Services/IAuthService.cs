using System.Threading.Tasks;

using MGME.Core.DTOs;

namespace MGME.Core.Interfaces.Services
{
    public interface IAuthService
    {
        Task <DataServiceResponse<string>> LoginUser(string name, string password);

        Task <BaseServiceResponse> RegisterUser(string name, string email, string password);

        Task <BaseServiceResponse> ConfirmEmailAddress(string token);
    }
}