using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;

using MGME.Core.DTOs;
using MGME.Core.DTOs.PlayerCharacter;
using MGME.Core.Interfaces.Services;

namespace MGME.Web.Controllers
{
    [Authorize(Roles = "GameMaster,Admin")]
    public class PlayerCharacterController : BaseAPIController
    {
        private readonly IPlayerCharacterService _playerCharacterService;

        public PlayerCharacterController(IPlayerCharacterService playerCharacterService)
        {
            _playerCharacterService = playerCharacterService;
        }

        [HttpGet]
        public async Task <IActionResult> GetAllPlayerCharacters([FromQuery] string sorting, int? page)
        {
            PaginatedDataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>> response = await _playerCharacterService.GetAllPlayerCharacters(
                sorting ?? "name", page ?? 1
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpGet("{id}")]
        public async Task <IActionResult> GetPlayerCharacter(int id)
        {
            DataServiceResponse<GetPlayerCharacterDetailDTO> response = await _playerCharacterService.GetPlayerCharacter(id);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpPost("Add")]
        public async Task <IActionResult> AddPlayerCharacter(AddPlayerCharacterDTO newPlayerCharacter)
        {
            BaseServiceResponse response = await _playerCharacterService.AddPlayerCharacter(newPlayerCharacter);

            if (response.Success)
            {
                return Ok(response);
            }

            return BadRequest(response);
        }

        [HttpPut("Update")]
        public async Task <IActionResult> UpdatePlayerCharacter(UpdatePlayerCharacterDTO updatedPlayerCharacter)
        {
            BaseServiceResponse response = await _playerCharacterService.UpdatePlayerCharacter(updatedPlayerCharacter);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }

        [HttpDelete("Delete")]
        public async Task <IActionResult> DeletePlayerCharacter(DeletePlayerCharactersDTO playerCharactersToDelete)
        {
            BaseServiceResponse response = await _playerCharacterService.DeletePlayerCharacters(
                playerCharactersToDelete.Ids
            );

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}