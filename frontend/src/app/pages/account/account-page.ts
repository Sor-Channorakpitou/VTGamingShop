import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { CartStore } from '../../core/cart.store';

@Component({
  selector: 'app-account-page',
  imports: [RouterLink, NgIcon],
  template: `
    @if (auth.user(); as user) {
      <div class="page max-w-4xl py-10">
        <div class="card overflow-hidden">
          <div class="h-24 bg-linear-to-r from-brand-600 to-brand-accent"></div>
          <div class="flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end">
            <span
              class="-mt-10 flex size-20 items-center justify-center rounded-2xl bg-white text-2xl font-bold text-brand-700 shadow-lg ring-4 ring-white dark:bg-gray-800 dark:text-brand-300 dark:ring-gray-900"
              >{{ initials() }}</span
            >
            <div class="flex-1">
              <h1 class="text-2xl font-bold">{{ user.name }}</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
            </div>
            <div class="flex gap-2">
              <a [href]="auth.accountConsoleUrl" class="btn btn-secondary">
                <ng-icon name="lucideUser" size="16" /> Manage account
              </a>
              <button type="button" class="btn btn-ghost" (click)="auth.logout()">
                <ng-icon name="lucideLogOut" size="16" /> Log out
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 grid gap-6 md:grid-cols-2">
          <section class="card p-6" aria-labelledby="profile-title">
            <h2 id="profile-title" class="font-semibold">Profile</h2>
            <dl class="mt-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">First name</dt>
                <dd class="font-medium">{{ user.firstName || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">Last name</dt>
                <dd class="font-medium">{{ user.lastName || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">Email</dt>
                <dd class="truncate font-medium">{{ user.email || '—' }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">Account type</dt>
                <dd>
                  @if (auth.isAdmin()) {
                    <span class="badge bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                      <ng-icon name="lucideShield" size="12" /> Admin
                    </span>
                  } @else {
                    <span class="badge bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">Customer</span>
                  }
                </dd>
              </div>
            </dl>
            <p class="mt-5 text-xs text-gray-500 dark:text-gray-400">
              Change your name, email or password with “Manage account”.
            </p>
          </section>

          <section class="card flex flex-col p-6" aria-labelledby="orders-title">
            <h2 id="orders-title" class="font-semibold">Orders</h2>
            <div class="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <span class="flex size-12 items-center justify-center rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800">
                <ng-icon name="lucidePackage" size="22" />
              </span>
              <p class="text-sm text-gray-500 dark:text-gray-400">Your orders will show up here once online ordering opens.</p>
              @if (cart.count() > 0) {
                <a routerLink="/cart" class="btn btn-secondary btn-sm mt-2">View cart ({{ cart.count() }})</a>
              }
            </div>
          </section>

          @if (auth.isAdmin()) {
            <section class="card flex items-center gap-4 p-6 md:col-span-2">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <ng-icon name="lucideShield" size="22" />
              </span>
              <div class="flex-1">
                <h2 class="font-semibold">Shop admin</h2>
                <p class="text-sm text-gray-500 dark:text-gray-400">Add, edit and remove products in the catalog.</p>
              </div>
              <a routerLink="/admin/products" class="btn btn-primary">Manage products</a>
            </section>
          }
        </div>
      </div>
    }
  `,
})
export class AccountPage {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartStore);

  protected readonly initials = computed(() => {
    const user = this.auth.user();
    if (!user) return '';
    return ((user.firstName[0] ?? '') + (user.lastName[0] ?? '') || user.name[0] || '?').toUpperCase();
  });
}
