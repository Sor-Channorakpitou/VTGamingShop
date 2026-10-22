import { CurrencyPipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { CartItem, CartStore, FREE_SHIPPING_THRESHOLD } from '../../core/cart.store';
import { ToastService } from '../../core/toast.service';
import { QuantityStepper } from '../../shared/quantity-stepper';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, CurrencyPipe, NgIcon, QuantityStepper],
  template: `
    <div class="page py-10">
      <h1 class="text-3xl font-bold tracking-tight">Your cart</h1>

      @if (cart.items().length === 0) {
        <div class="card mt-8 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <span class="flex size-14 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
            <ng-icon name="lucideShoppingBag" size="26" />
          </span>
          <h2 class="text-lg font-semibold">Your cart is empty</h2>
          <p class="max-w-sm text-sm text-gray-500 dark:text-gray-400">Find something you like and it will show up here.</p>
          <a routerLink="/products" class="btn btn-primary mt-2">Start shopping</a>
        </div>
      } @else {
        <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <!-- Items -->
          <ul class="card divide-y divide-gray-200 dark:divide-gray-800" aria-label="Items in your cart">
            @for (item of cart.items(); track item.productId) {
              <li class="anim-fade flex gap-4 p-4 sm:p-5" animate.leave="anim-leave">
                <a [routerLink]="['/products', item.productId]" class="product-tile size-24 shrink-0 rounded-xl p-2 sm:size-28">
                  <img [src]="item.imageUrl" [alt]="item.name" class="h-full w-full object-contain" />
                </a>
                <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                  <div class="flex-1">
                    <a [routerLink]="['/products', item.productId]" class="font-semibold hover:text-brand-600 dark:hover:text-brand-300">{{ item.name }}</a>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ item.price | currency: 'USD' }} each</p>
                    @if (item.quantity >= item.stock) {
                      <p class="mt-1 text-xs text-amber-700 dark:text-amber-300">That's all we have in stock.</p>
                    }
                  </div>
                  <div class="flex items-center justify-between gap-4 sm:justify-end">
                    <app-quantity-stepper
                      [value]="item.quantity"
                      (valueChange)="cart.setQuantity(item.productId, $event)"
                      [max]="item.stock"
                      [label]="item.name"
                    />
                    <p class="w-24 text-right font-semibold tabular-nums">{{ item.price * item.quantity | currency: 'USD' }}</p>
                    <button type="button" class="icon-btn hover:text-red-600!" (click)="remove(item)" [attr.aria-label]="'Remove ' + item.name">
                      <ng-icon name="lucideTrash2" size="18" />
                    </button>
                  </div>
                </div>
              </li>
            }
          </ul>

          <!-- Summary -->
          <aside class="card h-fit p-6 lg:sticky lg:top-24" aria-labelledby="summary-title">
            <h2 id="summary-title" class="text-lg font-semibold">Order summary</h2>

            <div class="mt-4 rounded-xl bg-brand-50 p-4 dark:bg-brand-900/20">
              @if (cart.amountToFreeShipping() > 0) {
                <p class="text-sm">Add <strong>{{ cart.amountToFreeShipping() | currency: 'USD' }}</strong> more for free shipping.</p>
              } @else {
                <p class="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-300">
                  <ng-icon name="lucideTruck" size="18" /> You get free shipping!
                </p>
              }
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-white dark:bg-gray-800" role="progressbar" [attr.aria-valuenow]="shippingProgress()" aria-valuemin="0" aria-valuemax="100">
                <div class="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-accent transition-all duration-500" [style.width.%]="shippingProgress()"></div>
              </div>
            </div>

            <dl class="mt-6 space-y-3 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500 dark:text-gray-400">Items ({{ cart.count() }})</dt>
                <dd class="font-medium tabular-nums">{{ cart.subtotal() | currency: 'USD' }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500 dark:text-gray-400">Shipping</dt>
                <dd class="font-medium">{{ cart.amountToFreeShipping() > 0 ? 'Calculated at checkout' : 'Free' }}</dd>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-3 text-base dark:border-gray-800">
                <dt class="font-semibold">Subtotal</dt>
                <dd class="font-bold tabular-nums">{{ cart.subtotal() | currency: 'USD' }}</dd>
              </div>
            </dl>

            @if (auth.isLoggedIn()) {
              <button type="button" class="btn btn-primary btn-lg mt-6 w-full" disabled>Checkout</button>
              <p class="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                Online ordering opens soon. Your cart is saved on this device until then.
              </p>
            } @else {
              <button type="button" class="btn btn-primary btn-lg mt-6 w-full" (click)="auth.login('/cart')">
                Log in to check out
              </button>
              <p class="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                New here?
                <button type="button" class="font-semibold text-brand-600 hover:underline dark:text-brand-300" (click)="auth.register('/cart')">Create an account</button>
              </p>
            }

            <a routerLink="/products" class="btn btn-ghost mt-3 w-full">
              <ng-icon name="lucideArrowLeft" size="16" /> Continue shopping
            </a>
          </aside>
        </div>
      }
    </div>
  `,
})
export class CartPage {
  protected readonly cart = inject(CartStore);
  protected readonly auth = inject(AuthService);
  private readonly toasts = inject(ToastService);

  protected readonly shippingProgress = computed(() =>
    Math.min(100, Math.round((this.cart.subtotal() / FREE_SHIPPING_THRESHOLD) * 100)),
  );

  protected remove(item: CartItem): void {
    this.cart.remove(item.productId);
    this.toasts.info(`Removed "${item.name}" from your cart.`);
  }
}
