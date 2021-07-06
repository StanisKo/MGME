using AutoMapper;

using MGME.Core.Entities;
using MGME.Core.DTOs.Thread;

namespace MGME.Core.Profiles
{
    public class ThreadProfile : Profile
    {
        public ThreadProfile()
        {
            CreateMap<AddThreadDTO, Thread>();
        }
    }
}