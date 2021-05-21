using System;

namespace MGME.Core.Constants
{
    public static class DataAccessConfig
    {
        public const int PAGINATE_BY = 15;

        public static int GetNumberOfPages(int numberOfResults) => (int)Math.Ceiling(numberOfResults / (double)PAGINATE_BY);
    }
}