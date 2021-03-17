using System.Threading.Tasks;

using MGME.Core.DTOs;

namespace MGME.Core.Interfaces.Services
{
    public interface IAuthService
    {
        // Login user and return service response with JWT
        Task <DataServiceResponse<string>> LoginUser(string name, string password);

        // Add user to database and return confirmation
        Task <BaseServiceResponse> RegisterUser(string name, string email, string password);
    }
}