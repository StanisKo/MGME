namespace MGME.Core.DTOs
{
    // Values are nullable, since some service responses should contain pagination and some not
    public class Pagination
    {
        public int? Page { get; set; }

        public int? NumberOfResults { get; set; }

        public int? NumberOfPages { get; set; }
    }
}