using AutoMapper;

using MGME.Core.Entities;
using MGME.Core.DTOs.SceneItem;

namespace MGME.Core.Profiles
{
    public class SceneItemProfile : Profile
    {
        public SceneItemProfile()
        {
            CreateMap<AddSceneItemDTO, SceneItem>();
        }
    }
}