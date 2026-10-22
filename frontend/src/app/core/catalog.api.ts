import { HttpClient, HttpResourceRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  imageUrl: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'rating', label: 'Top rated' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name' },
];

export interface ProductQuery {
  search?: string;
  category?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

export type ProductInput = Omit<Product, 'id'>;

const BASE = '/api/products';

/** Request for httpResource: GET /api/products with only the filters that are set. */
export function productsRequest(query: ProductQuery): HttpResourceRequest {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') params[key] = value;
  }
  return { url: BASE, params };
}

export const productUrl = (id: number) => `${BASE}/${id}`;
export const categoriesUrl = `${BASE}/categories`;

/** Writes go through HttpClient; reads use httpResource in the pages. */
@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private readonly http = inject(HttpClient);

  create(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(BASE, input);
  }

  update(id: number, input: ProductInput): Observable<Product> {
    return this.http.put<Product>(productUrl(id), input);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(productUrl(id));
  }
}

/** Product photos shipped with the storefront, offered when editing a product. */
export const PRODUCT_IMAGES = [
  { url: 'Images/Products/headset.png', label: 'Headset' },
  { url: 'Images/Cart/mouse.png', label: 'Mouse' },
  { url: 'Images/Home/Controller.png', label: 'Controller' },
  { url: 'Images/Order/PS5.png', label: 'Console' },
  { url: 'Images/Products/PC.png', label: 'Gaming PC' },
];
