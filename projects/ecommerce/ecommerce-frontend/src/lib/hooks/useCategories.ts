import { useQuery } from '@tanstack/react-query';
import { categoryApi } from '@/lib/api/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryApi.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCategoryTree() {
  return useQuery({
    queryKey: ['categories', 'tree'],
    queryFn: categoryApi.getTree,
    staleTime: 5 * 60 * 1000,
  });
}