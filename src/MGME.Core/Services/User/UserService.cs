using System;
using System.Reflection;
using System.Threading.Tasks;
using System.Collections.Generic;

using AutoMapper;

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
        private readonly IEntityRepository<User> _repository;

        private readonly IHashingService _hashingService;

        private readonly IMapper _mapper;

        public UserService(IEntityRepository<User> userRepository,
                           IHashingService hashingService,
                           IMapper mapper,
                           IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _repository = userRepository;
            _hashingService = hashingService;
            _mapper = mapper;
        }

        public async Task <DataServiceResponse<GetOrUpdateUserDTO>> GetUser()
        {
            DataServiceResponse<GetOrUpdateUserDTO> response = new DataServiceResponse<GetOrUpdateUserDTO>();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetOrUpdateUserDTO user = await _repository.GetEntityAsync(
                    id: userId,
                    columnsToSelect: user => new GetOrUpdateUserDTO()
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

        public async Task <BaseServiceResponse> UpdateUser(GetOrUpdateUserDTO updatedUser)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                GetOrUpdateUserDTO userToUpdate = await _repository.GetEntityAsync(
                    id: userId,
                    columnsToSelect: user => new GetOrUpdateUserDTO()
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email
                    }
                );

                if (userToUpdate == null)
                {
                    response.Success = false;
                    response.Message = "User does not exist";

                    return response;
                }

                /*
                Here we use reflections, to loop through updated properties
                and assign their values to the object queried from the database

                If the property is missing from request
                (we know that since possible fields are nullable and after serialization will be null)
                we simply skip the update, effectively updating only provided fields
                */
                Type typeOfUser = userToUpdate.GetType();

                PropertyInfo[] updatedProperties = updatedUser.GetType().GetProperties();

                // Is used later to let context know which properties to update
                List<string> propertiesToUpdate = new List<string>();

                foreach (PropertyInfo updatedProperty in updatedProperties)
                {
                    if (updatedProperty.GetValue(updatedUser) == null || updatedProperty.Name == "Id")
                    {
                        continue;
                    }

                    PropertyInfo propertyToUpdate = typeOfUser.GetProperty(updatedProperty.Name);

                    propertyToUpdate.SetValue(
                        userToUpdate,
                        updatedProperty.GetValue(updatedUser)
                    );

                    propertiesToUpdate.Add(updatedProperty.Name);
                }

                await _repository.UpdateEntityAsync(
                    _mapper.Map<User>(userToUpdate),
                    propertiesToUpdate
                );

                response.Success = true;
                response.Message = $"User was successfully updated";

                return response;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> ChageUserPassword(ChangeUserPasswordDTO passwords)
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                UserPasswordDTO userToChangePassword = await _repository.GetEntityAsync(
                    id: userId,
                    columnsToSelect: user => new UserPasswordDTO()
                    {
                        Id = user.Id,
                        PasswordHash = user.PasswordHash,
                        PasswordSalt = user.PasswordSalt
                    }
                );

                if (userToChangePassword == null)
                {
                    response.Success = false;
                    response.Message = "User does not exist";

                    return response;
                }

                bool passwordIsValid = _hashingService.VerifyPasswordHash(
                    passwords.OldPassword,
                    userToChangePassword.PasswordHash,
                    userToChangePassword.PasswordSalt
                );

                if (!passwordIsValid)
                {
                    response.Success = false;
                    response.Message = "Wrong password";

                    return response;
                }

                _hashingService.CreatePasswordHash(
                    passwords.NewPassword,
                    out byte[] passwordHash,
                    out byte[] passwordSalt
                );

                userToChangePassword.PasswordHash = passwordHash;
                userToChangePassword.PasswordSalt = passwordSalt;

                await _repository.UpdateEntityAsync(
                    _mapper.Map<User>(userToChangePassword),
                    new[] { nameof(User.PasswordHash), nameof(User.PasswordSalt) }
                );

                response.Success = true;
                response.Message = "Password was successfully changed";
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }

        public async Task <BaseServiceResponse> DeleteUser()
        {
            BaseServiceResponse response = new BaseServiceResponse();

            int userId = GetUserIdFromHttpContext();

            try
            {
                User userToDelete = await _repository.GetEntityAsync(userId);

                if (userToDelete == null)
                {
                    response.Success = false;
                    response.Message = "User does not exist";

                    return response;
                }

                await _repository.DeleteEntityAsync(userToDelete);

                response.Success = true;
                response.Message = $"{userToDelete.Name} was successfully deleted";

                return response;
            }
            catch (Exception exception)
            {
                response.Success = false;
                response.Message = exception.Message;
            }

            return response;
        }
    }
}