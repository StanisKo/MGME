using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.Adventure;
using MGME.Core.DTOs.NonPlayerCharacter;
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

        [HttpGet]
        public async Task <IActionResult> GetAllAdventures([FromQuery] string sorting, int? page)
        {
            PaginatedDataServiceResponse<IEnumerable<GetAdventureListDTO>> response = await _adventureService.GetAllAdventures(
                sorting ?? "title", page ?? 1
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetAdventure(int id)
        {
            DataServiceResponse<GetAdventureDetailDTO> response = await _adventureService.GetAdventure(id);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddAdventure(AddAdventureDTO newAdventure)
        {
            BaseServiceResponse response = await _adventureService.AddAdventure(newAdventure);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPost("AddTo")]
        public async Task <IActionResult> AddToAdventure(AddRemoveToFromAdventureDTO ids)
        {
            BaseServiceResponse response = await _adventureService.AddToAdventure(ids);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPost("RemoveFrom")]
        public async Task<IActionResult> RemoveFromAdventure(AddRemoveToFromAdventureDTO ids)
        {
            BaseServiceResponse response = await _adventureService.RemoveFromAdventure(ids);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpDelete("Delete")]
        public async Task <IActionResult> DeleteAdventure(EntitiesToDelete adventuresToDelete)
        {
            BaseServiceResponse response = await _adventureService.DeleteAdventure(
                adventuresToDelete.Ids
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPut("Update")]
        public async Task <IActionResult> UpdateAdventure(UpdateAdventureDTO updatedAdventure)
        {
            BaseServiceResponse response = await _adventureService.UpdateAdventure(
                updatedAdventure
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPost("AddNewNPC")]
        public async Task <IActionResult> AddNewNonPlayerCharacterToAdventure(AddNonPlayerCharacterDTO newNonPlayerCharacter)
        {
            BaseServiceResponse response = await _adventureService.AddNewNonPlayerCharacterToAdventure(
                newNonPlayerCharacter
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }
    }
}
