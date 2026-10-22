import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { Product } from '../core/catalog.api';
import { AddToCart } from './add-to-cart';
import { StarRating } from './star-rating';
import { StockLabel } from './stock-label';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe, NgIcon, StarRating, StockLabel],
  template: `
    @let p = product();
    <article
      class="card group relative flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-brand-600/10"
    >
      <a [routerLink]="['/products', p.id]" class="product-tile block aspect-square p-6">
        <img
          [src]="p.imageUrl"
          [alt]="p.name"
          loading="lazy"
          class="h-full w-full object-contain transition duration-300 group-hover:scale-105"
          [class.opacity-50]="p.stock === 0"
        />
      </a>
      <div class="absolute top-3 left-3"><app-stock-label [stock]="p.stock" /></div>

      <div class="flex flex-1 flex-col gap-2 p-4">
        <p class="text-xs font-semibold tracking-wide text-brand-600 uppercase dark:text-brand-300">
          {{ p.category }}
        </p>
        <h3 class="leading-snug font-semibold">
          <a [routerLink]="['/products', p.id]" class="hover:text-brand-600 dark:hover:text-brand-300">
            <span class="absolute inset-0 z-0" aria-hidden="true"></span>{{ p.name }}
          </a>
        </h3>
        <app-star-rating [rating]="p.rating" size="14" />
        <div class="mt-auto flex items-center justify-between gap-2 pt-2">
          <p class="text-lg font-bold">{{ p.price | currency: 'USD' }}</p>
          <button
            type="button"
            class="btn btn-primary btn-sm relative z-10"
            [disabled]="p.stock === 0"
            (click)="add()"
            [attr.aria-label]="'Add ' + p.name + ' to cart'"
          >
            <ng-icon [name]="justAdded() ? 'lucideCheck' : 'lucideShoppingCart'" size="16" />
            {{ justAdded() ? 'Added' : 'Add' }}
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly addToCart = inject(AddToCart);
  protected readonly justAdded = signal(false);

  protected add(): void {
    if (this.addToCart.add(this.product())) {
      this.justAdded.set(true);
      setTimeout(() => this.justAdded.set(false), 1500);
    }
  }
}

@Component({
  selector: 'app-product-card-skeleton',
  template: `
    <div class="card overflow-hidden" aria-hidden="true">
      <div class="skeleton aspect-square rounded-none"></div>
      <div class="space-y-3 p-4">
        <div class="skeleton h-3 w-16"></div>
        <div class="skeleton h-4 w-3/4"></div>
        <div class="skeleton h-3 w-20"></div>
        <div class="flex items-center justify-between pt-2">
          <div class="skeleton h-6 w-16"></div>
          <div class="skeleton h-8 w-16 rounded-xl"></div>
        </div>
      </div>
    </div>
  `,
})
export class ProductCardSkeleton {}
