using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;

namespace MGME.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task <DataServiceResponse<GetUserDTO>> GetUser();

        Task <BaseServiceResponse> UpdateUser(UpdateUserDTO updatedUser);

        Task <BaseServiceResponse> ChageUserPassword(ChangeUserPasswordDTO passwords);
    }
}