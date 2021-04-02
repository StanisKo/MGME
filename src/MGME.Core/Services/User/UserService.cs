using System;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.DTOs.User;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.UserService
{
    public class UserService : BaseEntityService, IUserService
    {
        private readonly IEntityRepository<User> _userRepository;

        public UserService(IEntityRepository<User> userRepository,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _userRepository = userRepository;
        }

        public async Task <DataServiceResponse<GetUserDTO>> GetUser()
        {
            DataServiceResponse<GetUserDTO> response = new DataServiceResponse<GetUserDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetUserDTO user = await _userRepository.GetEntityAsync(
                    id: userId,
                    columnsToSelect: user => new GetUserDTO()
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email
                    }
                );

                if (user == null)
                {
                    response.Success = false;
                    response.Message = "User not found";

                    return response;
                }

                response.Data = user;
                response.Success = true;

            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public Task <BaseServiceResponse> UpdateUser(UpdateUserDTO user)
        {
            throw new System.NotImplementedException();
        }

        public Task <BaseServiceResponse> ChageUserPassword(ChangeUserPasswordDTO passwords)
        {
            throw new System.NotImplementedException();
        }
    }
}