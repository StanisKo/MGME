using System;
using System.Linq;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Utils.Sorters
{
    /*
    We don't parse string to Entity's property, but create mapper of string to lambda[], since
    we want to sort on multiple columns, based on one parameter
    */

    public class PlayerCharacterSorter : EntitySorter<PlayerCharacter>
    {
        public Tuple<IEnumerable<Expression<Func<PlayerCharacter, object>>>, SortOrder> DetermineSorting(string sortingParameter)
        {
            return base.DetermineSorting(sortingParameter, _playerCharacterSortingOptions);
        }

        // NB: No need to sort on ids as the last resort, since indexes forbid for those entities to have identical names
        private Dictionary<string, List<Expression<Func<PlayerCharacter, object>>>> _playerCharacterSortingOptions = new()
        {
            {
                "name", new()
                {
                    playerCharacter => playerCharacter.Name
                }
            },
            {
                "thread", new()
                {
                    playerCharacter => playerCharacter.Threads.Count,
                    playerCharacter => playerCharacter.Threads.FirstOrDefault().Name,
                }
            },
            {
                "adventure", new()
                {
                    playerCharacter => playerCharacter.Adventures.Count,
                    playerCharacter => playerCharacter.Adventures.FirstOrDefault().Title,
                }
            },
            {
                "npc", new()
                {
                    playerCharacter => playerCharacter.NonPlayerCharacters.Count,
                    playerCharacter => playerCharacter.NonPlayerCharacters.FirstOrDefault().Name,
                }
            }
        };
    }
}