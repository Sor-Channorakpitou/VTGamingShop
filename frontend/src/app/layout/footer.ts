import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="mt-20 border-t border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div class="page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <a routerLink="/" class="flex items-center gap-2">
            <img src="Images/logo.png" alt="" class="h-8 w-auto" />
            <span class="text-lg font-extrabold">VTStore</span>
          </a>
          <p class="mt-3 max-w-xs text-sm text-gray-500 dark:text-gray-400">
            Gaming accessories, repairs and setup advice in Phnom Penh.
          </p>
        </div>

        <div>
          <h2 class="text-sm font-semibold">Shop</h2>
          <ul class="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
            @for (category of categories; track category) {
              <li>
                <a
                  routerLink="/products"
                  [queryParams]="{ category }"
                  class="hover:text-brand-600 dark:hover:text-brand-300"
                  >{{ category }}</a
                >
              </li>
            }
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-semibold">VTStore</h2>
          <ul class="mt-3 space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <li><a routerLink="/services" class="hover:text-brand-600 dark:hover:text-brand-300">Services</a></li>
            <li><a routerLink="/contact" class="hover:text-brand-600 dark:hover:text-brand-300">Contact</a></li>
            <li><a routerLink="/account" class="hover:text-brand-600 dark:hover:text-brand-300">My account</a></li>
          </ul>
        </div>

        <div>
          <h2 class="text-sm font-semibold">Visit us</h2>
          <address class="mt-3 space-y-2 text-sm text-gray-500 not-italic dark:text-gray-400">
            <p>Russian Federation Blvd (110), Phnom Penh</p>
            <p><a href="tel:+855717729859" class="hover:text-brand-600 dark:hover:text-brand-300">+855 71 772 9859</a></p>
          </address>
        </div>
      </div>
      <div class="border-t border-gray-200 py-6 dark:border-gray-800">
        <p class="page text-xs text-gray-500 dark:text-gray-400">© {{ year }} VTStore. All rights reserved.</p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
  protected readonly categories = ['Headsets', 'Mice', 'Controllers', 'Consoles', 'PCs'];
}
