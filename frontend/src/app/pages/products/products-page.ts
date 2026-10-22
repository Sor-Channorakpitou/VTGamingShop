import { httpResource } from '@angular/common/http';
import { Component, computed, inject, input, linkedSignal, numberAttribute } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { debounceTime, distinctUntilChanged, skip } from 'rxjs';
import {
  PagedResult,
  Product,
  ProductSort,
  SORT_OPTIONS,
  categoriesUrl,
  productsRequest,
} from '../../core/catalog.api';
import { categoryIcon } from '../../icons';
import { ErrorState } from '../../shared/error-state';
import { ProductCard, ProductCardSkeleton } from '../../shared/product-card';
import { valueOf } from '../../shared/resource';

const PAGE_SIZE = 12;

@Component({
  selector: 'app-products-page',
  imports: [FormsModule, NgIcon, ProductCard, ProductCardSkeleton, ErrorState],
  template: `
    <div class="page py-10">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight">{{ category() || 'All products' }}</h1>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
            @if (results(); as r) {
              {{ r.totalCount }} {{ r.totalCount === 1 ? 'product' : 'products' }}
              @if (q()) {
                for “{{ q() }}”
              }
            } @else {
              Loading products…
            }
          </p>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="mt-6 flex flex-col gap-3 sm:flex-row">
        <div class="relative flex-1">
          <ng-icon
            name="lucideSearch"
            size="18"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            type="search"
            class="input pl-10"
            placeholder="Search by name or description"
            aria-label="Search products"
            [ngModel]="searchText()"
            (ngModelChange)="searchText.set($event)"
          />
        </div>
        <label class="relative sm:w-56">
          <span class="sr-only">Sort by</span>
          <select
            class="input cursor-pointer appearance-none pr-10"
            [ngModel]="sort() ?? 'featured'"
            (ngModelChange)="setQuery({ sort: $event === 'featured' ? null : $event, page: null })"
          >
            @for (option of sortOptions; track option.value) {
              <option [value]="option.value">{{ option.label }}</option>
            }
          </select>
          <ng-icon
            name="lucideChevronDown"
            size="16"
            class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400"
          />
        </label>
      </div>

      <!-- Categories -->
      <div class="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Category">
        <button
          type="button"
          class="chip"
          [class.chip-active]="!category()"
          [attr.aria-pressed]="!category()"
          (click)="setQuery({ category: null, page: null })"
        >
          <ng-icon name="lucideLayoutGrid" size="15" /> All
        </button>
        @for (c of categoryList(); track c) {
          <button
            type="button"
            class="chip"
            [class.chip-active]="category() === c"
            [attr.aria-pressed]="category() === c"
            (click)="setQuery({ category: c, page: null })"
          >
            <ng-icon [name]="icon(c)" size="15" /> {{ c }}
          </button>
        }
      </div>

      <!-- Results -->
      <div class="mt-6">
        @if (products.error() && !results()) {
          <app-error-state (retry)="products.reload()" />
        } @else if (results(); as r) {
          @if (r.items.length === 0) {
            <div class="card flex flex-col items-center gap-3 px-6 py-16 text-center">
              <span class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                <ng-icon name="lucideSearchX" size="22" />
              </span>
              <h2 class="text-lg font-semibold">No products found</h2>
              <p class="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                Try a different search word or another category.
              </p>
              <button type="button" class="btn btn-secondary mt-2" (click)="clearFilters()">Clear filters</button>
            </div>
          } @else {
            <div
              class="grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              [class.opacity-60]="products.isLoading()"
              [attr.aria-busy]="products.isLoading()"
            >
              @for (product of r.items; track product.id) {
                <app-product-card [product]="product" />
              }
            </div>

            @if (pageCount() > 1) {
              <nav class="mt-10 flex items-center justify-center gap-1" aria-label="Pages">
                <button
                  type="button"
                  class="icon-btn"
                  [disabled]="currentPage() <= 1"
                  (click)="goToPage(currentPage() - 1)"
                  aria-label="Previous page"
                >
                  <ng-icon name="lucideChevronLeft" size="18" />
                </button>
                @for (n of pageNumbers(); track n) {
                  <button
                    type="button"
                    class="size-10 rounded-xl text-sm font-semibold transition"
                    [class]="n === currentPage() ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
                    [attr.aria-current]="n === currentPage() ? 'page' : null"
                    (click)="goToPage(n)"
                  >
                    {{ n }}
                  </button>
                }
                <button
                  type="button"
                  class="icon-btn"
                  [disabled]="currentPage() >= pageCount()"
                  (click)="goToPage(currentPage() + 1)"
                  aria-label="Next page"
                >
                  <ng-icon name="lucideChevronRight" size="18" />
                </button>
              </nav>
            }
          }
        } @else {
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            @for (i of skeletons; track i) {
              <app-product-card-skeleton />
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class ProductsPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Query parameters, bound by the router (withComponentInputBinding).
  readonly q = input<string>();
  readonly category = input<string>();
  readonly sort = input<ProductSort>();
  readonly page = input(1, { transform: (v: unknown) => numberAttribute(v, 1) });

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly icon = categoryIcon;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);

  protected readonly categories = httpResource<string[]>(() => categoriesUrl);
  protected readonly categoryList = computed(() => valueOf(this.categories) ?? []);
  protected readonly products = httpResource<PagedResult<Product>>(() =>
    productsRequest({
      search: this.q(),
      category: this.category(),
      sort: this.sort(),
      page: this.page(),
      pageSize: PAGE_SIZE,
    }),
  );

  // Keep showing the previous results (dimmed) while the next ones load.
  protected readonly results = linkedSignal<PagedResult<Product> | undefined, PagedResult<Product> | undefined>({
    source: () => valueOf(this.products),
    computation: (value, previous) => value ?? previous?.value,
  });

  protected readonly currentPage = computed(() => this.results()?.page ?? 1);
  protected readonly pageCount = computed(() => {
    const r = this.results();
    return r ? Math.ceil(r.totalCount / r.pageSize) : 0;
  });
  protected readonly pageNumbers = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i + 1),
  );

  // The search box follows the URL, and typing updates the URL after a short pause.
  protected readonly searchText = linkedSignal(() => this.q() ?? '');

  constructor() {
    toObservable(this.searchText)
      .pipe(skip(1), debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => {
        if (text.trim() !== (this.q() ?? '')) {
          this.setQuery({ q: text.trim() || null, page: null }, true);
        }
      });
  }

  protected setQuery(params: Params, replaceUrl = false): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  protected goToPage(page: number): void {
    this.setQuery({ page: page === 1 ? null : page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected clearFilters(): void {
    this.searchText.set('');
    void this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}
