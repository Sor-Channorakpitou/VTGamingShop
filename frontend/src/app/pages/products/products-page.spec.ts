import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { PagedResult, Product } from '../../core/catalog.api';
import { ICONS } from '../../icons';
import { ProductsPage } from './products-page';

const product = (id: number, name: string, stock = 10): Product => ({
  id,
  name,
  description: '',
  category: 'Mice',
  price: 29.99,
  stock,
  rating: 4,
  imageUrl: 'Images/Cart/mouse.png',
});

const emptyPage: PagedResult<Product> = { items: [], page: 1, pageSize: 12, totalCount: 0 };

describe('ProductsPage', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), provideIcons(ICONS)],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  // Renders the page and answers the categories request. The products request is left open.
  function render(inputs: Record<string, unknown> = {}): ComponentFixture<ProductsPage> {
    const fixture = TestBed.createComponent(ProductsPage);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    fixture.detectChanges();
    TestBed.tick();
    http.expectOne('/api/products/categories').flush(['Mice', 'PCs']);
    return fixture;
  }

  async function settle(fixture: ComponentFixture<ProductsPage>): Promise<HTMLElement> {
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  const productsRequest = () => http.expectOne((r) => r.url === '/api/products');

  it('sends the filters from the URL to the API', async () => {
    const fixture = render({ q: 'mouse', category: 'Mice', sort: 'price-asc', page: 2 });

    const request = productsRequest();
    expect(request.request.params.get('search')).toBe('mouse');
    expect(request.request.params.get('category')).toBe('Mice');
    expect(request.request.params.get('sort')).toBe('price-asc');
    expect(request.request.params.get('page')).toBe('2');
    request.flush(emptyPage);
    await settle(fixture);
  });

  it('shows skeletons, then a card per product', async () => {
    const fixture = render();
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('app-product-card-skeleton').length).toBe(8);

    productsRequest().flush({
      items: [product(1, 'Gaming Mouse'), product(2, 'Ultralight Mouse', 0)],
      page: 1,
      pageSize: 12,
      totalCount: 2,
    });
    const el = await settle(fixture);

    const cards = el.querySelectorAll('app-product-card');
    expect(cards.length).toBe(2);
    expect(el.textContent).toContain('2 products');
    expect(cards[1].textContent).toContain('Out of stock');
    expect(cards[1].querySelector('button')!.disabled).toBe(true);
  });

  it('shows an empty state with a way to clear filters', async () => {
    const fixture = render({ q: 'zzz' });

    productsRequest().flush(emptyPage);
    const el = await settle(fixture);

    expect(el.textContent).toContain('No products found');
    expect(el.textContent).toContain('Clear filters');
  });

  it('offers a retry when the API fails', async () => {
    const fixture = render();

    productsRequest().flush('down', { status: 503, statusText: 'Unavailable' });
    const el = await settle(fixture);

    expect(el.textContent).toContain('Try again');
  });
});
