using AutoMapper;

using MGME.Core.Entities;
using MGME.Core.DTOs.User;

namespace MGME.Core.Profiles
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<UserConfirmEmailDTO, User>();

            CreateMap<UserRefreshTokenDTO, User>();
        }
    }
}