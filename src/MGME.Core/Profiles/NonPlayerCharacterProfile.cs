using AutoMapper;

using MGME.Core.Entities;
using MGME.Core.DTOs.NonPlayerCharacter;

namespace MGME.Core.Profiles
{
    public class NonPlayerCharacterProfile : Profile
    {
        public NonPlayerCharacterProfile()
        {
            CreateMap<AddNonPlayerCharacterDTO, NonPlayerCharacter>();
        }
    }
}