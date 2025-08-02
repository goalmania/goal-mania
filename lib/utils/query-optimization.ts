// lib/utils/query-optimization.ts - Query optimization utilities

/**
 * Common query optimizations for MongoDB operations
 */

// Optimize query with field selection and lean()
export const optimizeQuery = (query: any) => {
  return query.lean();
};

// Common field selections for different models
export const USER_SAFE_FIELDS = '-password -__v';
export const PRODUCT_LIST_FIELDS = '_id title description basePrice retroPrice shippingPrice stockQuantity images isRetro hasShorts hasSocks category allowsNumberOnShirt allowsNameOnShirt isActive feature slug isMysteryBox createdAt';
export const ARTICLE_LIST_FIELDS = '_id title summary image category league author status publishedAt createdAt slug featured';
export const ORDER_LIST_FIELDS = '_id amount status createdAt items customerId';

// Text search optimization
export const createTextSearchQuery = (searchTerm: string, fields: string[]) => {
  if (!searchTerm) return {};
  
  return {
    $or: fields.map(field => ({
      [field]: { $regex: searchTerm, $options: 'i' }
    }))
  };
};

// Pagination helper with optimization
export const createPaginatedQuery = (
  model: any,
  query: any,
  page: number,
  limit: number,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  selectFields?: string
) => {
  const skip = (page - 1) * limit;
  const sort: any = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  let findQuery = model.find(query).sort(sort).skip(skip).limit(limit);
  
  if (selectFields) {
    findQuery = findQuery.select(selectFields);
  }
  
  return findQuery.lean();
};

// Parallel count and find operations
export const getPaginatedResults = async (
  model: any,
  query: any,
  page: number,
  limit: number,
  sortBy: string = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'desc',
  selectFields?: string
) => {
  const [total, data] = await Promise.all([
    model.countDocuments(query),
    createPaginatedQuery(model, query, page, limit, sortBy, sortOrder, selectFields)
  ]);

  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    }
  };
};

// Aggregation pipeline optimizations
export const optimizeAggregationPipeline = (pipeline: any[]) => {
  // Add $match stages as early as possible
  // Add $limit stages when appropriate
  // Use $project to limit fields early in the pipeline
  return pipeline;
};

// Common aggregation stages
export const COMMON_AGGREGATIONS = {
  // Recent items by date
  recentByDate: (days: number, dateField: string = 'createdAt') => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return [
      { $match: { [dateField]: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: `$${dateField}` } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
  },

  // Monthly aggregation
  monthlyByDate: (months: number, dateField: string = 'createdAt') => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    return [
      { $match: { [dateField]: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: `$${dateField}` } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ];
  },

  // Count by field
  countByField: (field: string) => [
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ],

  // Top selling products
  topSellingProducts: (limit: number = 10) => [
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit }
  ]
};

// Cache key generators for different query types
export const CACHE_KEY_GENERATORS = {
  productsList: (category: string, page: number, limit: number, filters: string = '') => 
    `products:${category}:${page}:${limit}:${filters}`,
  
  articlesList: (category: string, page: number, status: string = '') => 
    `articles:${category}:${page}:${status}`,
  
  usersList: (role: string, page: number, search: string = '') => 
    `users:${role}:${page}:${search}`,
};

export default {
  optimizeQuery,
  createTextSearchQuery,
  createPaginatedQuery,
  getPaginatedResults,
  optimizeAggregationPipeline,
  COMMON_AGGREGATIONS,
  CACHE_KEY_GENERATORS,
  USER_SAFE_FIELDS,
  PRODUCT_LIST_FIELDS,
  ARTICLE_LIST_FIELDS,
  ORDER_LIST_FIELDS,
};