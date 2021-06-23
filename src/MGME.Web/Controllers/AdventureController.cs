using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class AdventureController : BaseAPIController
    {
        private readonly IAdventureService _adventureService;

        public AdventureController(IAdventureService adventureService)
        {
            _adventureService = adventureService;
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddAventure(AddAdventureDTO newAdventure)
        {
            BaseServiceResponse response = await _adventureService.AddAdventure(newAdventure);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }
    }
}