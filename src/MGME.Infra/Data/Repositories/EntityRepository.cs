using System;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.Utils;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Infra.Data.Repositories
{
    public class EntityRepository<TEntity> : IEntityRepository<TEntity> where TEntity: BaseEntity, new()
    {
        private readonly ApplicationDbContext _database;

        public EntityRepository(ApplicationDbContext database)
        {
            _database = database;
        }

        public async Task <TEntity> GetEntityAsync(int? id = null,
                                                   bool tracking = false,
                                                   bool splitQuery = false,
                                                   Expression<Func<TEntity, bool>> predicate = null,
                                                   IEnumerable<string> include = null)
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            // Don't track unless explicitly specified
            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            // Join requested entities
            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            // Split query if explicitly requested
            if (splitQuery)
            {
                query = query.AsSplitQuery();
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query.SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                return await query
                    .Where(predicate)
                        .SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.FirstOrDefaultAsync(predicate);
        }

        public async Task <TEntityDTO> GetEntityAsync<TEntityDTO>(int? id = null,
                                                                  Expression<Func<TEntity, bool>> predicate = null,
                                                                  IEnumerable<string> include = null,
                                                                  Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO : BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>().AsNoTracking();

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query
                    .Select(select)
                        .SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                return await query
                    .Where(predicate)
                        .Select(select)
                            .SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.Where(predicate).Select(select).FirstOrDefaultAsync();
        }


        public async Task<List<TEntity>> GetEntititesAsync(bool tracking = false,
                                                           Expression<Func<TEntity, bool>> predicate = null,
                                                           IEnumerable<string> include = null,
                                                           Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
                                                           int? page = null)
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                // Parse priority of sorting and order direction
                (IEnumerable<Expression<Func<TEntity, object>>> fields, SortOrder order) = orderBy;

                // Order by first field in priority
                query = order == SortOrder.ASCENDING
                    ? query.OrderBy(fields.First())
                        : query.OrderByDescending(fields.First());

                // Order by other fields in the same direction as the first
                for (int i = 0; i < fields.Skip(1).Count(); i++)
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(fields.ElementAt(i))
                            : (query as IOrderedQueryable<TEntity>).ThenByDescending(fields.ElementAt(i));
                }
            }

            // Paginate
            if (page != null)
            {
                query = query
                    .Skip(((int)page - 1) * DataAccessHelpers.PAGINATE_BY)
                        .Take(DataAccessHelpers.PAGINATE_BY);
            }

            return await query.ToListAsync();
        }

        public async Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(Expression<Func<TEntity, bool>> predicate = null,
                                                                           IEnumerable<string> include = null,
                                                                           Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
                                                                           int? page = null,
                                                                           Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (include != null)
            {
                for (int i = 0; i < include.Count(); i++)
                {
                    query = query.Include(include.ElementAt(i));
                }
            }

            if (predicate != null)
            {
                query = query.Where(predicate);
            }

            if (orderBy != null)
            {
                (IEnumerable<Expression<Func<TEntity, object>>> fields, SortOrder order) = orderBy;

                query = order == SortOrder.ASCENDING
                    ? query.OrderBy(fields.First())
                        : query.OrderByDescending(fields.First());

                for (int i = 0; i < fields.Skip(1).Count(); i++)
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(fields.ElementAt(i))
                            : (query as IOrderedQueryable<TEntity>).ThenByDescending(fields.ElementAt(i));
                }
            }

            if (page != null)
            {
                query = query
                    .Skip(((int)page - 1) * DataAccessHelpers.PAGINATE_BY)
                        .Take(DataAccessHelpers.PAGINATE_BY);
            }

            return await query.Select(select).ToListAsync();
        }


        public async Task AddEntityAsync(TEntity entity)
        {
            await _database.Set<TEntity>().AddAsync(entity);

            await _database.SaveChangesAsync();
        }


        public async Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties)
        {
            // Don't change anything on the entity
            _database.Entry(entity).State = EntityState.Unchanged;

            // But the provided fields
            for (int i = 0; i < updatedProperties.Count(); i++)
            {
                _database
                    .Entry(entity)
                        .Property(updatedProperties.ElementAt(i)).IsModified = true;
            }

            await _database.SaveChangesAsync();
        }


        public async Task LinkEntitiesAsync(IEnumerable<TEntity> entities, string linkingProperty)
        {
            // No changes to the entities we're linking
            for (int i = 0; i < entities.Count(); i++)
            {
                _database.Set<TEntity>().Attach(entities.ElementAt(i));

                // Only change the linking property
                _database
                    .Entry(entities.ElementAt(i))
                        .Property(linkingProperty).IsModified = true;
            }

            await _database.SaveChangesAsync();
        }

        public async Task LinkEntitiesAsync(IEnumerable<TEntity> entities, BaseEntity linkedEntity, string linkingCollection)
        {
            // No changes to entities we're linking
            for (int i = 0; i < entities.Count(); i++)
            {
                _database.Entry(entities.ElementAt(i)).State = EntityState.Unchanged;
            }

            // No changes to the linked entity
            _database.Entry(linkedEntity).State = EntityState.Unchanged;

            // Only change the collection on the linked entity (and thus write to mapping table)
            _database.Entry(linkedEntity).Collection(linkingCollection).IsModified = true;

            await _database.SaveChangesAsync();
        }


        public async Task UnlinkEntitiesAsync(BaseEntity linkedEntity, string linkingCollection)
        {
            // No changes to the linked entity
            _database.Entry(linkedEntity).State = EntityState.Unchanged;

            // Only change the collection on the linked entity (and thus remove entries in the mapping table)
            _database.Entry(linkedEntity).Collection(linkingCollection).IsModified = true;

            await _database.SaveChangesAsync();
        }


        public async Task DeleteEntityAsync(TEntity entity)
        {
            _database.Set<TEntity>().Remove(entity);

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntitiesAsync(IEnumerable<int> ids)
        {
            /*
            Initialize a collection of entities we want to remove
            in order to avoid querying for objects we want to remove
            */
            IEnumerable<TEntity> entities = ids.Select(id => new TEntity { Id = id });

            _database.Set<TEntity>().RemoveRange(entities);

            await _database.SaveChangesAsync();
        }

        public async Task <bool> CheckIfEntityExistsAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _database.Set<TEntity>().AnyAsync(
                predicate
            );
        }

        public async Task <int> GetEntitiesCountAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await _database.Set<TEntity>().Where(predicate).CountAsync();
        }
    }
}
