using System.Threading.Tasks;

using MGME.Core.DTOs;
using MGME.Core.DTOs.User;

namespace MGME.Core.Interfaces.Services
{
    public interface IUserService
    {
        Task <DataServiceResponse<GetOrUpdateUserDTO>> GetUser();

        Task <BaseServiceResponse> UpdateUser(GetOrUpdateUserDTO updatedUser);

        Task <BaseServiceResponse> ChangeUserPassword(ChangeUserPasswordDTO passwords);

        Task <BaseServiceResponse> DeleteUser();
    }
}