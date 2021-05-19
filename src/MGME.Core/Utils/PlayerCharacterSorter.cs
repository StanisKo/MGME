using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils
{
    /*
    We don't parse string to Entity's property, but create mapper of string to lambda[], since
    we want to sort on multiple columns, based on one parameter
    */

    public class PlayerCharacterSorter : EntitySorter
    {
        // This should be shared by all sorters
        public Tuple<IEnumerable<Expression<Func<PlayerCharacter, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            (string parameter, SortOrder order) = ParseSortingParameter(sortingParameter);

            IEnumerable<string> allowedParameters = _playerCharacterSortingPriority.Keys;

            if (!allowedParameters.Contains(parameter))
            {
                throw new Exception(
                    $"Provided sorting parameter is not supported. Sorting must be: {string.Join(", ", allowedParameters)}"
                );
            }

            List<Expression<Func<PlayerCharacter, object>>> priority = _playerCharacterSortingPriority.GetValueOrDefault(
                parameter
            );

            return new Tuple<IEnumerable<Expression<Func<PlayerCharacter, object>>>, SortOrder>(priority, order);
        }

        private Dictionary<string, List<Expression<Func<PlayerCharacter, object>>>> _playerCharacterSortingPriority = new()
        {
            {
                "name", new()
                {
                    playerCharacter => playerCharacter.Name
                }
            },
            {
                "adventure", new()
                {
                    playerCharacter => playerCharacter.Adventures.Count,
                    playerCharacter => playerCharacter.Adventures.FirstOrDefault().Title,
                    playerCharacter => playerCharacter.Adventures.FirstOrDefault().Id
                }
            },
            {
                "npc", new()
                {
                    playerCharacter => playerCharacter.NonPlayerCharacters.Count,
                    playerCharacter => playerCharacter.NonPlayerCharacters.FirstOrDefault().Name,
                    playerCharacter => playerCharacter.NonPlayerCharacters.FirstOrDefault().Id
                }
            }
        };
    }
}