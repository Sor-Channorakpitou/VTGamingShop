import { Component } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-contact-page',
  imports: [NgIcon],
  template: `
    <div class="page py-14">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <div class="relative mx-auto w-full max-w-md">
          <div class="absolute inset-10 -z-10 rounded-full bg-brand-500/25 blur-3xl"></div>
          <img src="Images/Contact/human.png" alt="" class="w-full" />
        </div>

        <div>
          <h1 class="text-4xl font-bold tracking-tight text-balance">Want gaming accessories? Contact us now!</h1>
          <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Have a question or need support? Contact us anytime for product inquiries, service requests, or help with your order.
          </p>

          <div class="mt-8 grid gap-4 sm:grid-cols-2">
            <a [href]="mapsUrl" target="_blank" rel="noopener" class="card group flex gap-4 p-5 transition hover:ring-brand-300 dark:hover:ring-brand-700">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <ng-icon name="lucideMapPin" size="22" />
              </span>
              <div>
                <h2 class="font-semibold">Visit the store</h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Russian Federation Blvd (110), Phnom Penh</p>
                <span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-300">
                  Open in Maps <ng-icon name="lucideExternalLink" size="14" />
                </span>
              </div>
            </a>

            <a href="tel:+855717729859" class="card group flex gap-4 p-5 transition hover:ring-brand-300 dark:hover:ring-brand-700">
              <span class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <ng-icon name="lucidePhone" size="22" />
              </span>
              <div>
                <h2 class="font-semibold">Call us</h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">+855 71 772 9859</p>
                <span class="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:underline dark:text-brand-300">Call now</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ContactPage {
  protected readonly mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=' +
    encodeURIComponent('Russian Federation Blvd, Phnom Penh');
}
