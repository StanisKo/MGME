using AutoMapper;

using MGME.Core.Entities;
using MGME.Core.DTOs.Scene;

namespace MGME.Core.Profiles
{
    public class SceneProfile : Profile
    {
        public SceneProfile()
        {
            CreateMap<AddSceneDTO, Scene>();
        }
    }
}