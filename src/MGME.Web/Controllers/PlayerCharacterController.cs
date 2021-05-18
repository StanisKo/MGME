using System.Threading.Tasks;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.ModelBinding;

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
        public async Task <IActionResult> GetAllPlayerCharacters()
        {
            DataServiceResponse<IEnumerable<GetPlayerCharacterListDTO>> response = await _playerCharacterService.GetAllPlayerCharacters();

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
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
        public async Task <IActionResult> DeletePlayerCharacter([BindRequired, FromQuery] int id)
        {
            BaseServiceResponse response = await _playerCharacterService.DeletePlayerCharacter(id);

            if (response.Success)
            {
                return Ok(response);
            }

            return NotFound(response);
        }
    }
}