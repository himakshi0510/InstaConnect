const getPaginationParams = (query, defaultLimit = 10) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || String(defaultLimit), 10);
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

const getPaginationData = (items, page, limit, totalItems) => {
  const totalPages = Math.ceil(totalItems / limit);
  const hasMore = page < totalPages;
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasMore
    }
  };
};

module.exports = {
  getPaginationParams,
  getPaginationData
};
