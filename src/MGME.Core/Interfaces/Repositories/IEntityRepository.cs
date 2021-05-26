using System;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Constants;

namespace MGME.Core.Interfaces.Repositories
{
    public interface IEntityRepository<TEntity> where TEntity: BaseEntity, new()
    {
        // Get a single entity
        Task <TEntity> GetEntityAsync(int? id = null,
                                      bool tracking = false,
                                      Expression<Func<TEntity, bool>> predicate = null,
                                      IEnumerable<string> include = null);

        // For when we need to select only some columns
        Task <TEntityDTO> GetEntityAsync<TEntityDTO>(int? id = null,
                                                     bool tracking = false,
                                                     Expression<Func<TEntity, bool>> predicate = null,
                                                     IEnumerable<string> include = null,
                                                     Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO;

        // Get multiple entities
        Task <List<TEntity>> GetEntititesAsync(bool tracking = false,
                                               Expression<Func<TEntity, bool>> predicate = null,
                                               IEnumerable<string> include = null,
                                               Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
                                               int? page = null);

        // For when we need to select only some columns
        Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(bool tracking = false,
                                                              Expression<Func<TEntity, bool>> predicate = null,
                                                              IEnumerable<string> include = null,
                                                              Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
                                                              int? page = null,
                                                              Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO;

        // Add a single entity
        Task AddEntityAsync(TEntity entity);

        // Updates only specified fields
        Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties);

        // Update only specific fields on a collection of entities
        Task UpdateEntitiesAsync(IEnumerable<TEntity> entities, IEnumerable<string> updatedProperties);

        // Update many-to-many relationship between entity and linkedEntity
        Task LinkEntityAsync(TEntity entity, BaseEntity linkedEntity, string linkedCollection);

        // Delete one entity
        Task DeleteEntityAsync(TEntity entity);

        // Delete a collection of entities
        Task DeleteEntitiesAsync(IEnumerable<TEntity> entities);

        // Delete a collection of entities by their ids (avoiding pre-quering them)
        Task DeleteEntitiesAsync(IEnumerable<int> ids);

        // Count number of entities in db
        Task <int> GetEntitiesCount();
    }
}