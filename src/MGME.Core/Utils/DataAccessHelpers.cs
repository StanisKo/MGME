using System;

namespace MGME.Core.Utils
{
    public static class DataAccessHelpers
    {
        public const int PAGINATE_BY = 15;

        public static int GetNumberOfPages(int numberOfResults) => (int)Math.Ceiling(numberOfResults / (double)PAGINATE_BY);
    }
}