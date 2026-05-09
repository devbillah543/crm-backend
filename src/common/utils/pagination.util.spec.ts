import { normalizePagination } from './pagination.util';

describe('normalizePagination', () => {
  it('normalizes missing values to defaults', () => {
    expect(normalizePagination({})).toEqual({ page: 1, limit: 20 });
  });

  it('clamps invalid values into allowed range', () => {
    expect(normalizePagination({ page: 0, limit: 500 })).toEqual({
      page: 1,
      limit: 100,
    });
  });
});
