import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, ElementRef, computed, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import {
  CatalogApi,
  PRODUCT_IMAGES,
  PagedResult,
  Product,
  ProductInput,
  categoriesUrl,
  productsRequest,
} from '../../core/catalog.api';
import { ToastService } from '../../core/toast.service';
import { ErrorState } from '../../shared/error-state';
import { valueOf } from '../../shared/resource';
import { StockLabel } from '../../shared/stock-label';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-admin-products-page',
  imports: [ReactiveFormsModule, FormsModule, RouterLink, CurrencyPipe, NgIcon, ErrorState, StockLabel],
  template: `
    <div class="page py-10">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <a routerLink="/account" class="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400">
            <ng-icon name="lucideArrowLeft" size="14" /> Account
          </a>
          <h1 class="mt-1 text-3xl font-bold tracking-tight">Manage products</h1>
        </div>
        <button type="button" class="btn btn-primary" (click)="openEditor(null)">
          <ng-icon name="lucidePlus" size="18" /> New product
        </button>
      </header>

      <div class="relative mt-6 max-w-md">
        <ng-icon name="lucideSearch" size="18" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input type="search" class="input pl-10" placeholder="Search products" aria-label="Search products" [(ngModel)]="searchText" />
      </div>

      <div class="mt-6">
        @if (list.error() && !rows()) {
          <app-error-state (retry)="list.reload()" />
        } @else {
          <div class="card overflow-x-auto" [class.opacity-60]="list.isLoading()">
            <table class="w-full min-w-[720px] text-left text-sm">
              <thead class="border-b border-gray-200 text-xs tracking-wide text-gray-500 uppercase dark:border-gray-800 dark:text-gray-400">
                <tr>
                  <th scope="col" class="px-4 py-3 font-semibold">Product</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Category</th>
                  <th scope="col" class="px-4 py-3 text-right font-semibold">Price</th>
                  <th scope="col" class="px-4 py-3 font-semibold">Stock</th>
                  <th scope="col" class="px-4 py-3 text-right font-semibold"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                @if (rows(); as r) {
                  @for (p of r.items; track p.id) {
                    <tr class="transition hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-3">
                          <span class="product-tile size-11 shrink-0 rounded-lg p-1"><img [src]="p.imageUrl" alt="" class="h-full w-full object-contain" /></span>
                          <div>
                            <a [routerLink]="['/products', p.id]" class="font-semibold hover:text-brand-600 dark:hover:text-brand-300">{{ p.name }}</a>
                            <p class="text-xs text-gray-500 dark:text-gray-400">#{{ p.id }} · {{ p.rating }}★</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-3">{{ p.category }}</td>
                      <td class="px-4 py-3 text-right font-medium tabular-nums">{{ p.price | currency: 'USD' }}</td>
                      <td class="px-4 py-3"><span class="mr-2 tabular-nums">{{ p.stock }}</span><app-stock-label [stock]="p.stock" /></td>
                      <td class="px-4 py-3">
                        <div class="flex justify-end gap-1">
                          <button type="button" class="icon-btn" (click)="openEditor(p)" [attr.aria-label]="'Edit ' + p.name">
                            <ng-icon name="lucidePencil" size="16" />
                          </button>
                          <button type="button" class="icon-btn hover:text-red-600!" (click)="askDelete(p)" [attr.aria-label]="'Delete ' + p.name">
                            <ng-icon name="lucideTrash2" size="16" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr><td colspan="5" class="px-4 py-12 text-center text-gray-500 dark:text-gray-400">No products match your search.</td></tr>
                  }
                } @else {
                  @for (i of [1, 2, 3, 4, 5]; track i) {
                    <tr><td colspan="5" class="px-4 py-3"><div class="skeleton h-11 w-full"></div></td></tr>
                  }
                }
              </tbody>
            </table>
          </div>

          @if (pageCount() > 1) {
            <nav class="mt-4 flex items-center justify-between text-sm" aria-label="Pages">
              <p class="text-gray-500 dark:text-gray-400">Page {{ page() }} of {{ pageCount() }} · {{ rows()?.totalCount }} products</p>
              <div class="flex gap-2">
                <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() <= 1" (click)="page.set(page() - 1)">Previous</button>
                <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() >= pageCount()" (click)="page.set(page() + 1)">Next</button>
              </div>
            </nav>
          }
        }
      </div>
    </div>

    <!-- Create / edit -->
    <dialog
      #editor
      class="m-auto w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-white p-0 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-gray-100"
      aria-labelledby="editor-title"
      (close)="editing.set(undefined)"
    >
      <form [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
          <h2 id="editor-title" class="text-lg font-semibold">{{ editing() ? 'Edit product' : 'New product' }}</h2>
          <button type="button" class="icon-btn" (click)="editorDialog().nativeElement.close()" aria-label="Close">
            <ng-icon name="lucideX" size="18" />
          </button>
        </div>

        <div class="grid max-h-[70vh] gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="label" for="name">Name</label>
            <input id="name" class="input" formControlName="name" maxlength="200" />
            @if (showError('name')) { <p class="field-error">Give the product a name.</p> }
          </div>

          <div class="sm:col-span-2">
            <label class="label" for="description">Description</label>
            <textarea id="description" class="input min-h-24" formControlName="description" maxlength="2000"></textarea>
          </div>

          <div>
            <label class="label" for="category">Category</label>
            <input id="category" class="input" formControlName="category" list="category-options" maxlength="100" />
            <datalist id="category-options">
              @for (c of categoryList(); track c) { <option [value]="c"></option> }
            </datalist>
            @if (showError('category')) { <p class="field-error">Pick or type a category.</p> }
          </div>

          <div>
            <label class="label" for="price">Price (USD)</label>
            <input id="price" type="number" class="input" formControlName="price" min="0" step="0.01" />
            @if (showError('price')) { <p class="field-error">Enter a price of 0 or more.</p> }
          </div>

          <div>
            <label class="label" for="stock">Stock</label>
            <input id="stock" type="number" class="input" formControlName="stock" min="0" step="1" />
            @if (showError('stock')) { <p class="field-error">Enter a whole number of 0 or more.</p> }
          </div>

          <div>
            <span class="label" id="rating-label">Rating</span>
            <div class="flex gap-1" role="radiogroup" aria-labelledby="rating-label">
              @for (n of [1, 2, 3, 4, 5]; track n) {
                <button
                  type="button"
                  role="radio"
                  class="rounded-lg p-1 transition hover:scale-110"
                  [attr.aria-checked]="form.controls.rating.value === n"
                  [attr.aria-label]="n + ' stars'"
                  (click)="form.controls.rating.setValue(n)"
                >
                  <ng-icon name="lucideStar" size="24" [class]="n <= form.controls.rating.value ? 'text-amber-400 [&_svg]:fill-current' : 'text-gray-300 dark:text-gray-600'" />
                </button>
              }
            </div>
          </div>

          <fieldset class="sm:col-span-2">
            <legend class="label">Photo</legend>
            <div class="grid grid-cols-3 gap-2 sm:grid-cols-5">
              @for (image of images; track image.url) {
                <label
                  class="product-tile flex cursor-pointer flex-col items-center gap-1 rounded-xl p-2 ring-2 transition"
                  [class]="form.controls.imageUrl.value === image.url ? 'ring-brand-600' : 'ring-transparent hover:ring-brand-200'"
                >
                  <input type="radio" class="sr-only" formControlName="imageUrl" [value]="image.url" />
                  <img [src]="image.url" alt="" class="h-14 w-full object-contain" />
                  <span class="text-xs font-medium">{{ image.label }}</span>
                </label>
              }
            </div>
          </fieldset>

          @if (saveError()) {
            <p class="field-error sm:col-span-2" role="alert">{{ saveError() }}</p>
          }
        </div>

        <div class="flex justify-end gap-2 border-t border-gray-200 px-6 py-4 dark:border-gray-800">
          <button type="button" class="btn btn-secondary" (click)="editorDialog().nativeElement.close()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="saving()">
            @if (saving()) { <ng-icon name="lucideLoaderCircle" size="16" class="animate-spin" /> }
            {{ editing() ? 'Save changes' : 'Add product' }}
          </button>
        </div>
      </form>
    </dialog>

    <!-- Delete confirmation -->
    <dialog
      #confirm
      class="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-gray-900 shadow-2xl dark:bg-gray-900 dark:text-gray-100"
      aria-labelledby="confirm-title"
    >
      @if (deleting(); as p) {
        <h2 id="confirm-title" class="text-lg font-semibold">Delete “{{ p.name }}”?</h2>
        <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">It will disappear from the shop right away. This can't be undone.</p>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="btn btn-secondary" (click)="confirmDialog().nativeElement.close()">Cancel</button>
          <button type="button" class="btn btn-danger" [disabled]="saving()" (click)="delete(p)">
            @if (saving()) { <ng-icon name="lucideLoaderCircle" size="16" class="animate-spin" /> } Delete
          </button>
        </div>
      }
    </dialog>
  `,
})
export class AdminProductsPage {
  private readonly api = inject(CatalogApi);
  private readonly toasts = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly images = PRODUCT_IMAGES;
  protected readonly searchText = signal('');
  private readonly search = signal('');
  protected readonly page = linkedSignal({ source: this.search, computation: () => 1 });

  protected readonly categories = httpResource<string[]>(() => categoriesUrl);
  protected readonly categoryList = computed(() => valueOf(this.categories) ?? []);
  protected readonly list = httpResource<PagedResult<Product>>(() =>
    productsRequest({ search: this.search(), page: this.page(), pageSize: PAGE_SIZE }),
  );
  protected readonly rows = linkedSignal<PagedResult<Product> | undefined, PagedResult<Product> | undefined>({
    source: () => valueOf(this.list),
    computation: (value, previous) => value ?? previous?.value,
  });
  protected readonly pageCount = computed(() => {
    const r = this.rows();
    return r ? Math.ceil(r.totalCount / r.pageSize) : 0;
  });

  protected readonly editorDialog = viewChild.required<ElementRef<HTMLDialogElement>>('editor');
  protected readonly confirmDialog = viewChild.required<ElementRef<HTMLDialogElement>>('confirm');

  /** The product being edited: undefined when the editor is closed, null for a new one. */
  protected readonly editing = signal<Product | null | undefined>(undefined);
  protected readonly deleting = signal<Product | null>(null);
  protected readonly saving = signal(false);
  protected readonly saveError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    rating: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
    imageUrl: [PRODUCT_IMAGES[0].url, Validators.required],
  });

  constructor() {
    toObservable(this.searchText)
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((text) => this.search.set(text.trim()));
  }

  protected showError(control: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || c.dirty);
  }

  protected openEditor(product: Product | null): void {
    this.saveError.set(null);
    this.form.reset(
      product
        ? { ...product }
        : { name: '', description: '', category: '', price: 0, stock: 0, rating: 3, imageUrl: PRODUCT_IMAGES[0].url },
    );
    this.editing.set(product);
    this.editorDialog().nativeElement.showModal();
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const input: ProductInput = this.form.getRawValue();
    const editing = this.editing();
    this.saving.set(true);
    this.saveError.set(null);
    try {
      if (editing) {
        await firstValueFrom(this.api.update(editing.id, input));
        this.toasts.success(`Saved "${input.name}".`);
      } else {
        const created = await firstValueFrom(this.api.create(input));
        this.toasts.success(`Added "${created.name}" to the shop.`, { label: 'View', link: `/products/${created.id}` });
      }
      this.editorDialog().nativeElement.close();
      this.list.reload();
      this.categories.reload();
    } catch (error) {
      this.saveError.set(describe(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected askDelete(product: Product): void {
    this.deleting.set(product);
    this.confirmDialog().nativeElement.showModal();
  }

  protected async delete(product: Product): Promise<void> {
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.delete(product.id));
      this.toasts.success(`Deleted "${product.name}".`);
      this.confirmDialog().nativeElement.close();
      this.list.reload();
      this.categories.reload();
    } catch (error) {
      this.toasts.error(describe(error));
    } finally {
      this.saving.set(false);
    }
  }
}

function describe(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'Your session has expired. Log in again and retry.';
    if (error.status === 403) return 'Your account is not allowed to change products.';
    if (error.status === 400 && error.error?.errors) {
      return Object.values(error.error.errors as Record<string, string[]>).flat().join(' ');
    }
    if (error.status === 429) return 'Too many requests. Wait a few seconds and try again.';
  }
  return 'Something went wrong. Try again.';
}
