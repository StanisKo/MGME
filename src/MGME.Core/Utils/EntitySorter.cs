using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils
{
    public abstract class EntitySorter<TEntity> where TEntity: BaseEntity
    {
        protected Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> DetermineSorting(
            string sortingParameter,
            Dictionary<string, List<Expression<Func<TEntity, object>>>> sortingOptions)
        {
            (string parameter, SortOrder order) = ParseSortingParameter(sortingParameter);

            IEnumerable<string> allowedParameters = sortingOptions.Keys;

            if (!allowedParameters.Contains(parameter))
            {
                throw new Exception(
                    $"Provided sorting parameter is not supported. Sorting must be: {string.Join(", ", allowedParameters)}"
                );
            }

            List<Expression<Func<TEntity, object>>> priority = sortingOptions.GetValueOrDefault(
                parameter
            );

            return new Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder>(priority, order);
        }

        private Tuple<string, SortOrder> ParseSortingParameter(string sortingParameter)
        {
            string cleanedString = sortingParameter.Trim();

            return cleanedString.StartsWith('-')
                ? new Tuple<string, SortOrder>(sortingParameter.Substring(1), SortOrder.DESCENDING)
                : new Tuple<string, SortOrder>(sortingParameter, SortOrder.ASCENDING);
        }
    }
}