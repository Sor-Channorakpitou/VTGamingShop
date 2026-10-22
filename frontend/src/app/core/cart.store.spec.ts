import { TestBed } from '@angular/core/testing';
import { CartStore, STORAGE_KEY } from './cart.store';
import { Product } from './catalog.api';

const headset: Product = {
  id: 1,
  name: 'Gaming Headset',
  description: '',
  category: 'Headsets',
  price: 49.99,
  stock: 3,
  rating: 4,
  imageUrl: 'Images/Products/headset.png',
};

const pc: Product = { ...headset, id: 2, name: 'Gaming PC', category: 'PCs', price: 799.99, stock: 5 };

describe('CartStore', () => {
  let cart: CartStore;

  beforeEach(() => {
    localStorage.clear();
    cart = TestBed.inject(CartStore);
  });

  it('adds products and totals them', () => {
    cart.add(headset, 2);
    cart.add(pc);

    expect(cart.count()).toBe(3);
    expect(cart.subtotal()).toBe(899.97);
  });

  it('merges repeat adds of the same product', () => {
    cart.add(headset);
    cart.add(headset);

    expect(cart.items().length).toBe(1);
    expect(cart.quantityOf(headset.id)).toBe(2);
  });

  it('never adds more than the stock and reports how many were added', () => {
    expect(cart.add(headset, 2)).toBe(2);
    expect(cart.add(headset, 5)).toBe(1);
    expect(cart.add(headset)).toBe(0);
    expect(cart.quantityOf(headset.id)).toBe(3);
  });

  it('clamps quantity changes to the stock and removes at zero', () => {
    cart.add(headset);

    cart.setQuantity(headset.id, 10);
    expect(cart.quantityOf(headset.id)).toBe(3);

    cart.setQuantity(headset.id, 0);
    expect(cart.items()).toEqual([]);
  });

  it('tracks how much is left until free shipping', () => {
    cart.add(headset);
    expect(cart.amountToFreeShipping()).toBe(50.01);

    cart.add(headset);
    cart.add(headset);
    expect(cart.amountToFreeShipping()).toBe(0);
  });

  it('saves the cart to localStorage', () => {
    cart.add(pc);
    TestBed.tick();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(saved).toEqual([expect.objectContaining({ productId: pc.id, quantity: 1 })]);
  });
});
