using System.Threading.Tasks;

using Microsoft.AspNetCore.Http;

using MGME.Core.Entities;
using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.Interfaces.Services;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Core.Services.AdventureService
{
    public class AdventureService : BaseEntityService, IAdventureService
    {
        private readonly IEntityRepository<Adventure> _adventureRepository;

        public AdventureService(IEntityRepository<Adventure> adventureRepository,
                                IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor)
        {
            _adventureRepository = adventureRepository;
        }

        public Task <BaseServiceResponse> AddAdventure(AddAdventureDTO newAdventure)
        {
            throw new System.NotImplementedException();
        }
    }
}