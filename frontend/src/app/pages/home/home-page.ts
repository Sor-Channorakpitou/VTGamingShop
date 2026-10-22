import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { PagedResult, Product, categoriesUrl, productsRequest } from '../../core/catalog.api';
import { categoryIcon } from '../../icons';
import { ProductCard, ProductCardSkeleton } from '../../shared/product-card';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, NgIcon, ProductCard, ProductCardSkeleton],
  template: `
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_80%_20%,--theme(--color-brand-200/60%),transparent)] dark:bg-[radial-gradient(60%_60%_at_80%_20%,--theme(--color-brand-900/60%),transparent)]"
      ></div>
      <div class="page grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-24">
        <div class="anim-enter">
          <span class="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            <ng-icon name="lucideSparkles" size="14" /> New season gear is in
          </span>
          <h1 class="mt-5 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            The best
            <span class="bg-linear-to-r from-brand-600 to-brand-accent bg-clip-text text-transparent">gaming accessories</span>
            in town
          </h1>
          <p class="mt-5 max-w-lg text-lg text-gray-600 dark:text-gray-300">
            Headsets, mice, controllers, consoles and full gaming PCs, plus repairs and setup advice from people who play.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/products" class="btn btn-primary btn-lg">
              Shop all products <ng-icon name="lucideArrowRight" size="18" />
            </a>
            <a routerLink="/services" class="btn btn-secondary btn-lg">Our services</a>
          </div>
          <dl class="mt-10 grid max-w-md grid-cols-3 gap-6">
            @for (stat of stats; track stat.label) {
              <div>
                <dt class="text-xs text-gray-500 dark:text-gray-400">{{ stat.label }}</dt>
                <dd class="text-xl font-bold">{{ stat.value }}</dd>
              </div>
            }
          </dl>
        </div>
        <div class="relative mx-auto w-full max-w-md lg:max-w-none">
          <div class="absolute inset-8 -z-10 rounded-full bg-brand-500/30 blur-3xl"></div>
          <img
            src="Images/Home/Controller.png"
            alt="Wireless controller"
            class="w-full drop-shadow-2xl motion-safe:animate-[float_6s_ease-in-out_infinite]"
          />
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="page mt-6" aria-labelledby="categories-title">
      <div class="flex items-end justify-between">
        <h2 id="categories-title" class="text-2xl font-bold">Shop by category</h2>
      </div>
      <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        @if (categories.hasValue()) {
          @for (category of categories.value(); track category) {
            <a
              routerLink="/products"
              [queryParams]="{ category }"
              class="card group flex flex-col items-center gap-3 p-5 text-center transition hover:-translate-y-0.5 hover:ring-brand-300 dark:hover:ring-brand-700"
            >
              <span
                class="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white dark:bg-brand-900/30 dark:text-brand-300"
              >
                <ng-icon [name]="icon(category)" size="24" />
              </span>
              <span class="font-semibold">{{ category }}</span>
            </a>
          }
        } @else {
          @for (i of [1, 2, 3, 4, 5]; track i) {
            <div class="skeleton h-28 rounded-2xl"></div>
          }
        }
      </div>
    </section>

    <!-- Top rated -->
    <section class="page mt-16" aria-labelledby="featured-title">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h2 id="featured-title" class="text-2xl font-bold">Top rated</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">What our customers love the most.</p>
        </div>
        <a routerLink="/products" [queryParams]="{ sort: 'rating' }" class="btn btn-ghost">
          See all <ng-icon name="lucideArrowRight" size="16" />
        </a>
      </div>
      <div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @if (featured.hasValue()) {
          @for (product of featured.value().items; track product.id) {
            <app-product-card [product]="product" />
          }
        } @else if (featured.error()) {
          <p class="col-span-full text-sm text-gray-500">Products are unavailable right now.</p>
        } @else {
          @for (i of [1, 2, 3, 4]; track i) {
            <app-product-card-skeleton />
          }
        }
      </div>
    </section>

    <!-- Perks -->
    <section class="page mt-16">
      <div class="grid gap-4 md:grid-cols-3">
        @for (perk of perks; track perk.title) {
          <div class="card flex gap-4 p-6">
            <span
              class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300"
            >
              <ng-icon [name]="perk.icon" size="22" />
            </span>
            <div>
              <h3 class="font-semibold">{{ perk.title }}</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ perk.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- CTA -->
    <section class="page mt-16">
      <div
        class="relative overflow-hidden rounded-3xl bg-linear-to-br from-brand-600 to-brand-accent px-8 py-12 text-white sm:px-12"
      >
        <div class="absolute -top-16 -right-16 size-64 rounded-full bg-white/10 blur-2xl"></div>
        <div class="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 class="text-3xl font-bold">Not sure what to buy?</h2>
            <p class="mt-2 max-w-xl text-white/80">
              Tell us how you play and we'll help you plan the right setup, for one player or a whole team.
            </p>
          </div>
          <a routerLink="/contact" class="btn btn-lg bg-white text-brand-700 hover:bg-brand-50">
            <ng-icon name="lucideMessagesSquare" size="18" /> Talk to us
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-14px) rotate(2deg); }
    }
  `,
})
export class HomePage {
  protected readonly categories = httpResource<string[]>(() => categoriesUrl);
  protected readonly featured = httpResource<PagedResult<Product>>(() =>
    productsRequest({ sort: 'rating', pageSize: 4 }),
  );

  protected readonly icon = categoryIcon;

  protected readonly stats = [
    { label: 'Products', value: '20+' },
    { label: 'Categories', value: '5' },
    { label: 'Repairs', value: 'In-store' },
  ];

  protected readonly perks = [
    { icon: 'lucideTruck', title: 'Free shipping over $100', text: 'Order more, pay nothing for delivery.' },
    { icon: 'lucideWrench', title: 'Repairs in store', text: 'Broken controller or headset? We fix it.' },
    { icon: 'lucideShieldCheck', title: 'Secure sign-in', text: 'Your password never touches the shop.' },
  ];
}
