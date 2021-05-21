using System;
using System.Linq;
using System.Threading.Tasks;
using System.Linq.Expressions;
using System.Collections.Generic;

using Microsoft.EntityFrameworkCore;

using MGME.Core.DTOs;
using MGME.Core.Entities;
using MGME.Core.Constants;
using MGME.Core.Interfaces.Repositories;

namespace MGME.Infra.Data.Repositories
{
    public class EntityRepository<TEntity> : IEntityRepository<TEntity> where TEntity: BaseEntity
    {
        private readonly ApplicationDbContext _database;

        public EntityRepository(ApplicationDbContext database)
        {
            _database = database;
        }

        public async Task <TEntity> GetEntityAsync(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null)
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                foreach (string entity in include)
                {
                    query = query.Include(entity);
                }
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query.SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                query = query.Where(predicate);

                return await query.SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.FirstOrDefaultAsync(predicate);
        }

        public async Task <TEntityDTO> GetEntityAsync<TEntityDTO>(
            int? id = null,
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO : BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                foreach (string entity in include)
                {
                    query = query.Include(entity);
                }
            }

            // If we query only on primary key
            if (predicate == null && id != null)
            {
                return await query.Select(select).SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query on primary key and also want to filter
            if (predicate != null && id != null)
            {
                query = query.Where(predicate);

                return await query.Select(select).SingleOrDefaultAsync(entity => entity.Id == id);
            }

            // If we query only on filter avoiding primary key
            return await query.Where(predicate).Select(select).FirstOrDefaultAsync();
        }

        public async Task<List<TEntity>> GetEntititesAsync(
            bool tracking = false,
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
                foreach (string entity in include)
                {
                    query = query.Include(entity);
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

                foreach (Expression<Func<TEntity, object>> field in fields.Skip(1))
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(field)
                        : (query as IOrderedQueryable<TEntity>).ThenByDescending(field);
                }
            }

            if (page != null)
            {
                query = query.Skip(((int)page - 1) * DataAccessConfig.PAGINATE_BY).Take(DataAccessConfig.PAGINATE_BY);
            }

            return await query.ToListAsync();
        }

        public async Task <List<TEntityDTO>> GetEntititesAsync<TEntityDTO>(
            bool tracking = false,
            Expression<Func<TEntity, bool>> predicate = null,
            IEnumerable<string> include = null,
            Tuple<IEnumerable<Expression<Func<TEntity, object>>>, SortOrder> orderBy = null,
            int? page = null,
            Expression<Func<TEntity, TEntityDTO>> select = null) where TEntityDTO: BaseEntityDTO
        {
            IQueryable<TEntity> query = _database.Set<TEntity>();

            if (!tracking)
            {
                query = query.AsNoTracking();
            }

            if (include != null)
            {
                foreach (string entity in include)
                {
                    query = query.Include(entity);
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

                foreach (Expression<Func<TEntity, object>> field in fields.Skip(1))
                {
                    query = order == (int)SortOrder.ASCENDING
                        ? (query as IOrderedQueryable<TEntity>).ThenBy(field)
                        : (query as IOrderedQueryable<TEntity>).ThenByDescending(field);
                }
            }

            if (page != null)
            {
                query = query.Skip(((int)page - 1) * DataAccessConfig.PAGINATE_BY).Take(DataAccessConfig.PAGINATE_BY);
            }

            return await query.Select(select).ToListAsync();
        }

        public async Task AddEntityAsync(TEntity entity)
        {
            await _database.Set<TEntity>().AddAsync(entity);

            await _database.SaveChangesAsync();
        }

        public async Task AddEntitiesAsync(List<TEntity> entites)
        {
            await _database.Set<TEntity>().AddRangeAsync(entites);

            await _database.SaveChangesAsync();
        }

        public async Task UpdateEntityAsync(TEntity entity, IEnumerable<string> updatedProperties)
        {
            _database.Entry(entity).State = EntityState.Unchanged;

            foreach (string property in updatedProperties)
            {
                _database.Entry(entity).Property(property).IsModified = true;
            }

            await _database.SaveChangesAsync();
        }

        public async Task UpdateEntitiesAsync(List<TEntity> entities, IEnumerable<string> updatedProperties)
        {
            entities.ForEach(entity =>
            {
                _database.Set<TEntity>().Attach(entity);

                foreach (string property in updatedProperties)
                {
                    _database.Entry(entity).Property(property).IsModified = true;
                }
            });

            await _database.SaveChangesAsync();
        }

        public async Task LinkEntityAsync(TEntity entity, BaseEntity linkedEntity, string linkedCollection)
        {
            _database.Entry(entity).State = EntityState.Unchanged;

            _database.Entry(linkedEntity).State = EntityState.Unchanged;

            _database.Entry(entity).Collection(linkedCollection).IsModified = true;

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntityAsync(TEntity entity)
        {
            _database.Set<TEntity>().Remove(entity);

            await _database.SaveChangesAsync();
        }

        public async Task DeleteEntitiesAsync(List<TEntity> entities)
        {
            _database.Set<TEntity>().RemoveRange(entities);

            await _database.SaveChangesAsync();
        }

        public async Task <int> GetEntitiesCount()
        {
            return await _database.Set<TEntity>().CountAsync();
        }
    }
}
