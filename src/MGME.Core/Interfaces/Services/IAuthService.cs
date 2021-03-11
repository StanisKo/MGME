using System.Threading.Tasks;

using MGME.Core.DTOs;

namespace MGME.Core.Interfaces.Services
{
    public interface IAuthService
    {
        // Login user and return service response with JWT
        Task <DataServiceResponse<string>> LoginUser(string name, string email, string password);

        // Add user to database and return service response with user ID for client redirect
        Task <DataServiceResponse<int>> RegisterUser(string name, string email, string password);
    }
}