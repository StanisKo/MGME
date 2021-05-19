using System;

using MGME.Core.Constants;

namespace MGME.Core.Utils
{
    public class EntitySorter
    {
        protected Tuple<string, SortOrder> ParseSortingParameter(string sortingParameter)
        {
            string cleanedString = sortingParameter.Trim();

            return sortingParameter.StartsWith('-')
                ? new Tuple<string, SortOrder>(sortingParameter.Substring(1), SortOrder.DESCENDING)
                : new Tuple<string, SortOrder>(sortingParameter, SortOrder.ASCENDING);
        }
    }
}