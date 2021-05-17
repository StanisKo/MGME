namespace MGME.Core.DTOs.PlayerCharacter
{
    public class GetPlayerCharacterListDTO : BaseEntityDTO
    {
        public string Name { get; set; }

        public int AdventureCount { get; set; }

        public int NonPlayerCharacterCount { get; set; }
    }
}