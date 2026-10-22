import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { CartStore } from '../../core/cart.store';
import { Product } from '../../core/catalog.api';
import { ICONS } from '../../icons';
import { ProductDetailPage } from './product-detail-page';

const mouse: Product = {
  id: 7,
  name: 'Wireless Gaming Mouse',
  description: 'Low-latency wireless.',
  category: 'Mice',
  price: 59.99,
  stock: 2,
  rating: 4,
  imageUrl: 'Images/Cart/mouse.png',
};

describe('ProductDetailPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideIcons(ICONS)],
    });
    http = TestBed.inject(HttpTestingController);
  });

  async function render(id: number) {
    const fixture = TestBed.createComponent(ProductDetailPage);
    fixture.componentRef.setInput('id', id);
    fixture.detectChanges();
    TestBed.tick();
    return fixture;
  }

  it('says so when the product does not exist', async () => {
    const fixture = await render(999);

    http.expectOne('/api/products/999').flush(null, { status: 404, statusText: 'Not Found' });
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("This product doesn't exist");
    http.verify();
  });

  it('adds the chosen quantity to the cart, up to the stock', async () => {
    const fixture = await render(mouse.id);
    http.expectOne('/api/products/7').flush(mouse);
    // Once the product is in, the "more from this category" request starts.
    await new Promise((resolve) => setTimeout(resolve));
    TestBed.tick();
    http.expectOne((r) => r.url === '/api/products' && r.params.get('category') === 'Mice').flush({
      items: [mouse],
      page: 1,
      pageSize: 5,
      totalCount: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const increase = el.querySelector<HTMLButtonElement>('[aria-label="Increase quantity"]')!;
    increase.click();
    fixture.detectChanges();
    expect(increase.disabled).toBe(true); // stock is 2

    [...el.querySelectorAll('button')].find((b) => b.textContent?.includes('Add to cart'))!.click();
    fixture.detectChanges();

    expect(TestBed.inject(CartStore).quantityOf(mouse.id)).toBe(2);
    expect(el.textContent).toContain('2 already in your cart');
    http.verify();
  });
});
