import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from './catalog.api';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  quantity: number;
}

export const STORAGE_KEY = 'vt.cart';
export const FREE_SHIPPING_THRESHOLD = 100;

/**
 * The cart lives in the browser until the Order service arrives (roadmap step 3).
 * It is saved to localStorage and kept in step across open tabs.
 */
@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly items = signal<CartItem[]>(readCart());

  readonly count = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  readonly subtotal = computed(() =>
    round(this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)),
  );
  readonly amountToFreeShipping = computed(() =>
    Math.max(0, round(FREE_SHIPPING_THRESHOLD - this.subtotal())),
  );

  constructor() {
    effect(() => writeCart(this.items()));
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY) this.items.set(readCart());
    });
  }

  quantityOf(productId: number): number {
    return this.items().find((item) => item.productId === productId)?.quantity ?? 0;
  }

  /** Adds up to `quantity`, never more than the stock. Returns how many were added. */
  add(product: Product, quantity = 1): number {
    const current = this.quantityOf(product.id);
    const added = Math.max(0, Math.min(quantity, product.stock - current));
    if (added === 0) return 0;

    this.items.update((items) =>
      current > 0
        ? items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + added, price: product.price, stock: product.stock }
              : item,
          )
        : [
            ...items,
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
              quantity: added,
            },
          ],
    );
    return added;
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.remove(productId);
      return;
    }
    this.items.update((items) =>
      items.map((item) =>
        item.productId === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item,
      ),
    );
  }

  remove(productId: number): void {
    this.items.update((items) => items.filter((item) => item.productId !== productId));
  }

  clear(): void {
    this.items.set([]);
  }
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function readCart(): CartItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage blocked: the cart still works for this page view.
  }
}
