import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, linkedSignal, numberAttribute } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { CartStore } from '../../core/cart.store';
import { PagedResult, Product, productUrl, productsRequest } from '../../core/catalog.api';
import { AddToCart } from '../../shared/add-to-cart';
import { ErrorState } from '../../shared/error-state';
import { ProductCard } from '../../shared/product-card';
import { QuantityStepper } from '../../shared/quantity-stepper';
import { valueOf } from '../../shared/resource';
import { StarRating } from '../../shared/star-rating';
import { StockLabel } from '../../shared/stock-label';

@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, CurrencyPipe, NgIcon, StarRating, StockLabel, QuantityStepper, ProductCard, ErrorState],
  template: `
    <div class="page py-8">
      <nav aria-label="Breadcrumb" class="text-sm text-gray-500 dark:text-gray-400">
        <ol class="flex flex-wrap items-center gap-1.5">
          <li><a routerLink="/products" class="hover:text-brand-600 dark:hover:text-brand-300">Products</a></li>
          @if (loaded(); as p) {
            <li aria-hidden="true"><ng-icon name="lucideChevronRight" size="14" /></li>
            <li>
              <a routerLink="/products" [queryParams]="{ category: p.category }" class="hover:text-brand-600 dark:hover:text-brand-300">{{ p.category }}</a>
            </li>
            <li aria-hidden="true"><ng-icon name="lucideChevronRight" size="14" /></li>
            <li class="font-medium text-gray-900 dark:text-gray-100" aria-current="page">{{ p.name }}</li>
          }
        </ol>
      </nav>

      @if (notFound()) {
        <div class="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <h1 class="text-xl font-semibold">This product doesn't exist</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">It may have been removed from the shop.</p>
          <a routerLink="/products" class="btn btn-primary mt-2">Browse products</a>
        </div>
      } @else if (product.error()) {
        <div class="mt-8"><app-error-state (retry)="product.reload()" /></div>
      } @else if (loaded(); as p) {
        <div class="anim-fade mt-6 grid gap-10 lg:grid-cols-2">
          <div class="product-tile card flex aspect-square items-center justify-center p-10">
            <img [src]="p.imageUrl" [alt]="p.name" class="max-h-full w-full object-contain drop-shadow-xl" />
          </div>

          <div class="flex flex-col">
            <p class="text-sm font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">{{ p.category }}</p>
            <h1 class="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{{ p.name }}</h1>
            <div class="mt-3 flex items-center gap-3">
              <app-star-rating [rating]="p.rating" size="18" />
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ p.rating }}/5</span>
            </div>

            <p class="mt-6 text-3xl font-bold">{{ p.price | currency: 'USD' }}</p>
            <p class="mt-4 text-gray-600 dark:text-gray-300">{{ p.description }}</p>

            <div class="mt-6"><app-stock-label [stock]="p.stock" /></div>

            @if (p.stock > 0) {
              <div class="mt-6 flex flex-wrap items-center gap-3">
                <app-quantity-stepper [(value)]="quantity" [max]="maxQuantity()" [label]="p.name" />
                <button
                  type="button"
                  class="btn btn-primary btn-lg flex-1 sm:flex-none"
                  [disabled]="maxQuantity() === 0"
                  (click)="add(p)"
                >
                  <ng-icon name="lucideShoppingCart" size="18" /> Add to cart
                </button>
              </div>
              @if (inCart() > 0) {
                <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {{ inCart() }} already in your cart.
                  <a routerLink="/cart" class="font-semibold text-brand-600 hover:underline dark:text-brand-300">View cart</a>
                </p>
              }
            } @else {
              <p class="mt-6 text-sm text-gray-500 dark:text-gray-400">
                This one is sold out for now. Check back soon or
                <a routerLink="/contact" class="font-semibold text-brand-600 hover:underline dark:text-brand-300">ask us</a>
                when it's coming back.
              </p>
            }

            <ul class="mt-8 grid gap-3 border-t border-gray-200 pt-6 text-sm sm:grid-cols-3 dark:border-gray-800">
              <li class="flex items-center gap-2"><ng-icon name="lucideTruck" size="18" class="text-brand-600 dark:text-brand-300" /> Free shipping over $100</li>
              <li class="flex items-center gap-2"><ng-icon name="lucideWrench" size="18" class="text-brand-600 dark:text-brand-300" /> Repairs in store</li>
              <li class="flex items-center gap-2"><ng-icon name="lucideStore" size="18" class="text-brand-600 dark:text-brand-300" /> Pick up in Phnom Penh</li>
            </ul>
          </div>
        </div>

        @if (related().length > 0) {
          <section class="mt-16" aria-labelledby="related-title">
            <h2 id="related-title" class="text-2xl font-bold">More {{ p.category.toLowerCase() }}</h2>
            <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              @for (r of related(); track r.id) {
                <app-product-card [product]="r" />
              }
            </div>
          </section>
        }
      } @else {
        <div class="mt-6 grid gap-10 lg:grid-cols-2" aria-busy="true">
          <div class="skeleton aspect-square rounded-2xl"></div>
          <div class="space-y-4">
            <div class="skeleton h-4 w-24"></div>
            <div class="skeleton h-10 w-3/4"></div>
            <div class="skeleton h-5 w-32"></div>
            <div class="skeleton h-9 w-28"></div>
            <div class="skeleton h-20 w-full"></div>
          </div>
        </div>
      }
    </div>
  `,
})
export class ProductDetailPage {
  private readonly cart = inject(CartStore);
  private readonly addToCart = inject(AddToCart);
  private readonly title = inject(Title);

  // Route parameter, bound by the router.
  readonly id = input.required({ transform: numberAttribute });

  protected readonly product = httpResource<Product>(() => productUrl(this.id()));
  protected readonly loaded = computed(() => valueOf(this.product));
  private readonly sameCategory = httpResource<PagedResult<Product>>(() => {
    const category = valueOf(this.product)?.category;
    return category ? productsRequest({ category, sort: 'rating', pageSize: 5 }) : undefined;
  });

  protected readonly notFound = computed(
    () => (this.product.error() as HttpErrorResponse | undefined)?.status === 404,
  );
  protected readonly related = computed(() =>
    (valueOf(this.sameCategory)?.items ?? []).filter((p) => p.id !== this.id()).slice(0, 4),
  );

  protected readonly inCart = computed(() => this.cart.quantityOf(this.id()));
  protected readonly maxQuantity = computed(() =>
    Math.max(0, (this.loaded()?.stock ?? 0) - this.inCart()),
  );
  // Back to 1 whenever the product changes.
  protected readonly quantity = linkedSignal({ source: this.id, computation: () => 1 });

  constructor() {
    // Put the product name in the browser tab.
    effect(() => {
      const name = this.loaded()?.name;
      if (name) this.title.setTitle(`${name} – VTStore`);
    });
  }

  protected add(product: Product): void {
    if (this.addToCart.add(product, this.quantity())) this.quantity.set(1);
  }
}
