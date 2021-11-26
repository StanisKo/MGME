namespace MGME.Core.DTOs.Adventure
{
    public class UpdateAdventureDTO : BaseEntityDTO
    {
        public string Title { get; set; }

        public string Context { get; set; }

        public int? ChaosFactor { get; set; }
    }
}