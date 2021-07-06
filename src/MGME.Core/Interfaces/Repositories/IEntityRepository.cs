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
                                      bool splitQuery = false,
                                      Expression<Func<TEntity, bool>> predicate = null,
                                      IEnumerable<string> include = null);

        // For when we need to select only some columns
        Task <TEntityDTO> GetEntityAsync<TEntityDTO>(int? id = null,
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
        Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(Expression<Func<TEntity, bool>> predicate = null,
                                                              IEnumerable<string> include = null,
                                                              Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
                                                              int? page = null,
                                                              Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO;


        // Add a single entity
        Task AddEntityAsync(TEntity entity);


        // Updates only specific fields
        Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties);


        // Update many-to-one relationship between entities and another entity via linkingProperty
        Task LinkEntitiesAsync(IEnumerable<TEntity> entities, string linkingProperty);

        // Update many-to-many relationship between entities and linkedEntity via linkedCollection
        Task LinkEntitiesAsync(IEnumerable<TEntity> entities, BaseEntity linkedEntity, string linkingCollection);


        // Delete one entity
        Task DeleteEntityAsync(TEntity entity);

        // Delete a collection of entities by their ids (avoiding pre-quering them)
        Task DeleteEntitiesAsync(IEnumerable<int> ids);


        // Check if entity exists based on predicate
        Task <bool> CheckIfEntityExistsAsync(Expression<Func<TEntity, bool>> predicate);


        // Count number of entities in db
        Task <int> GetEntitiesCountAsync(Expression<Func<TEntity, bool>> predicate);
    }
}