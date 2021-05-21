namespace MGME.Core.DTOs
{
    public class PaginatedDataServiceResponse<TResult> : DataServiceResponse<TResult>
    {
        public Pagination Pagination { get; set; } = new Pagination();
    }
}