import { Injectable, inject } from '@angular/core';
import { CartStore } from '../core/cart.store';
import { Product } from '../core/catalog.api';
import { ToastService } from '../core/toast.service';

/** Adds to the cart and tells the user what happened. */
@Injectable({ providedIn: 'root' })
export class AddToCart {
  private readonly cart = inject(CartStore);
  private readonly toasts = inject(ToastService);

  add(product: Product, quantity = 1): boolean {
    const added = this.cart.add(product, quantity);
    if (added === 0) {
      this.toasts.info(`You already have all ${product.stock} of "${product.name}" in your cart.`);
      return false;
    }
    const message =
      added < quantity
        ? `Added ${added} (all that's left) of "${product.name}" to your cart.`
        : `Added ${added > 1 ? added + ' × ' : ''}"${product.name}" to your cart.`;
    this.toasts.success(message, { label: 'View cart', link: '/cart' });
    return true;
  }
}
