import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/auth/auth.service';
import { CartStore } from '../core/cart.store';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, FormsModule, NgIcon],
  template: `
    <header
      class="sticky top-0 z-40 border-b border-gray-200/80 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80"
    >
      <nav class="page flex h-16 items-center gap-3 lg:gap-6" aria-label="Main">
        <button
          type="button"
          class="icon-btn lg:hidden"
          (click)="menuOpen.set(!menuOpen())"
          [attr.aria-expanded]="menuOpen()"
          aria-controls="mobile-menu"
          aria-label="Menu"
        >
          <ng-icon [name]="menuOpen() ? 'lucideX' : 'lucideMenu'" size="22" />
        </button>

        <a routerLink="/" class="flex shrink-0 items-center gap-2" aria-label="VTStore home">
          <img src="Images/logo.png" alt="" class="h-8 w-auto" />
          <span class="hidden text-lg font-extrabold tracking-tight sm:inline">VTStore</span>
        </a>

        <ul class="hidden items-center gap-1 lg:flex">
          @for (link of links; track link.path) {
            <li>
              <a
                [routerLink]="link.path"
                routerLinkActive="!text-brand-600 dark:!text-brand-300 bg-brand-50 dark:bg-brand-900/30"
                [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >{{ link.label }}</a
              >
            </li>
          }
        </ul>

        <form
          role="search"
          class="relative ml-auto hidden w-full max-w-xs md:block"
          (submit)="search($event)"
        >
          <ng-icon
            name="lucideSearch"
            size="18"
            class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
          />
          <input
            #searchInput
            type="search"
            name="q"
            [(ngModel)]="query"
            placeholder="Search products"
            aria-label="Search products"
            class="input rounded-full! bg-gray-100! pl-10 ring-transparent! focus:bg-white! focus:ring-brand-500! dark:bg-gray-900!"
          />
        </form>

        <div class="ml-auto flex items-center gap-1 md:ml-0">
          <button
            type="button"
            class="icon-btn md:hidden"
            aria-label="Search"
            (click)="openMobileSearch()"
          >
            <ng-icon name="lucideSearch" size="20" />
          </button>

          <button
            type="button"
            class="icon-btn"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.theme() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <ng-icon [name]="theme.theme() === 'dark' ? 'lucideSun' : 'lucideMoon'" size="20" />
          </button>

          <a routerLink="/cart" class="icon-btn" [attr.aria-label]="'Cart, ' + cart.count() + ' items'">
            <ng-icon name="lucideShoppingCart" size="20" />
            @if (cart.count() > 0) {
              <span
                class="anim-enter absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-gray-950"
                >{{ cart.count() > 99 ? '99+' : cart.count() }}</span
              >
            }
          </a>

          @if (auth.user(); as user) {
            <div class="relative" #accountMenu>
              <button
                type="button"
                class="ml-1 flex items-center gap-2 rounded-full p-1 pr-2 transition hover:bg-gray-100 dark:hover:bg-gray-800"
                (click)="accountOpen.set(!accountOpen())"
                [attr.aria-expanded]="accountOpen()"
                aria-haspopup="menu"
              >
                <span
                  class="flex size-8 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-brand-accent text-sm font-bold text-white"
                  >{{ initials() }}</span
                >
                <ng-icon name="lucideChevronDown" size="16" class="hidden text-gray-500 sm:block" />
              </button>
              @if (accountOpen()) {
                <div
                  role="menu"
                  class="anim-enter card absolute right-0 mt-2 w-60 p-2 shadow-xl"
                  animate.leave="anim-leave"
                >
                  <div class="px-3 py-2">
                    <p class="truncate text-sm font-semibold">{{ user.name }}</p>
                    <p class="truncate text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                  </div>
                  <hr class="my-1 border-gray-200 dark:border-gray-800" />
                  <a role="menuitem" routerLink="/account" class="btn btn-ghost w-full justify-start"
                    ><ng-icon name="lucideUser" size="16" /> My account</a
                  >
                  @if (auth.isAdmin()) {
                    <a
                      role="menuitem"
                      routerLink="/admin/products"
                      class="btn btn-ghost w-full justify-start"
                      ><ng-icon name="lucideShield" size="16" /> Manage products</a
                    >
                  }
                  <button
                    role="menuitem"
                    type="button"
                    class="btn btn-ghost w-full justify-start text-red-600! dark:text-red-400!"
                    (click)="auth.logout()"
                  >
                    <ng-icon name="lucideLogOut" size="16" /> Log out
                  </button>
                </div>
              }
            </div>
          } @else {
            <button type="button" class="btn btn-ghost hidden sm:inline-flex" (click)="auth.login()">
              Log in
            </button>
            <button type="button" class="btn btn-primary ml-1" (click)="auth.register()">
              Sign up
            </button>
          }
        </div>
      </nav>

      @if (mobileSearchOpen()) {
        <form
          role="search"
          class="anim-fade page border-t border-gray-200 py-3 md:hidden dark:border-gray-800"
          (submit)="search($event)"
        >
          <input
            #mobileSearch
            type="search"
            name="q"
            [(ngModel)]="query"
            placeholder="Search products"
            aria-label="Search products"
            class="input"
          />
        </form>
      }

      @if (menuOpen()) {
        <div
          id="mobile-menu"
          class="anim-fade border-t border-gray-200 lg:hidden dark:border-gray-800"
        >
          <ul class="page flex flex-col gap-1 py-3">
            @for (link of links; track link.path) {
              <li>
                <a
                  [routerLink]="link.path"
                  routerLinkActive="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  [routerLinkActiveOptions]="{ exact: link.path === '/' }"
                  class="block rounded-lg px-3 py-2.5 font-semibold"
                  >{{ link.label }}</a
                >
              </li>
            }
            @if (!auth.isLoggedIn()) {
              <li>
                <button type="button" class="btn btn-secondary mt-2 w-full" (click)="auth.login()">
                  Log in
                </button>
              </li>
            }
          </ul>
        </div>
      }
    </header>
  `,
})
export class Header {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartStore);
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly links = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/services', label: 'Services' },
    { path: '/contact', label: 'Contact' },
  ];

  protected query = '';
  protected readonly menuOpen = signal(false);
  protected readonly accountOpen = signal(false);
  protected readonly mobileSearchOpen = signal(false);

  private readonly accountMenu = viewChild<ElementRef<HTMLElement>>('accountMenu');
  private readonly mobileSearch = viewChild<ElementRef<HTMLInputElement>>('mobileSearch');

  constructor() {
    // Close menus whenever the page changes.
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.accountOpen.set(false);
        this.mobileSearchOpen.set(false);
      });
  }

  protected initials(): string {
    const user = this.auth.user();
    if (!user) return '';
    const letters = (user.firstName[0] ?? '') + (user.lastName[0] ?? '');
    return (letters || user.name[0] || '?').toUpperCase();
  }

  protected search(event: Event): void {
    event.preventDefault();
    const q = this.query.trim();
    void this.router.navigate(['/products'], { queryParams: q ? { q } : {} });
  }

  protected openMobileSearch(): void {
    this.mobileSearchOpen.set(!this.mobileSearchOpen());
    setTimeout(() => this.mobileSearch()?.nativeElement.focus());
  }

  @HostListener('document:click', ['$event'])
  protected closeAccountMenuOnOutsideClick(event: MouseEvent): void {
    const menu = this.accountMenu()?.nativeElement;
    if (this.accountOpen() && menu && !menu.contains(event.target as Node)) {
      this.accountOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.accountOpen.set(false);
    this.menuOpen.set(false);
  }
}
