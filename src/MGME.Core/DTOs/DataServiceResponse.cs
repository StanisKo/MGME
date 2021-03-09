namespace RPG.Core.DTOs
{
    public class DataServiceResponse<TResult> : BaseServiceResponse
    {
        public TResult Data { get; set; }
    }
}