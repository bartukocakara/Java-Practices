import { useQuery } from '@tanstack/react-query';
import { vendorsApi } from '@/lib/api/vendors';

export function usePublicVendor(slug: string) {
  return useQuery({
    queryKey: ['vendor', slug],
    queryFn:  () => vendorsApi.getBySlug(slug),
    enabled:  !!slug,
    retry:    false,
  });
}

export function usePublicVendorProducts(slug: string) {
  return useQuery({
    queryKey: ['vendor', slug, 'products'],
    queryFn:  () => vendorsApi.getProducts(slug),
    enabled:  !!slug,
  });
}