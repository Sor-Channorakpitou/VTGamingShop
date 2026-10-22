import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-services-page',
  imports: [RouterLink, NgIcon],
  template: `
    <div class="page py-14">
      <header class="mx-auto max-w-2xl text-center">
        <h1 class="text-4xl font-bold tracking-tight">Our services</h1>
        <p class="mt-4 text-lg text-gray-600 dark:text-gray-300">
          From high-performance accessories to expert repairs and gaming setup consultation, we provide everything you need.
        </p>
      </header>

      <div class="mt-12 grid gap-6 md:grid-cols-3">
        @for (service of services; track service.title) {
          <article class="card group overflow-hidden">
            <div class="aspect-[4/3] overflow-hidden">
              <img [src]="service.image" [alt]="service.title" loading="lazy" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
            </div>
            <div class="p-6">
              <span class="flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-300">
                <ng-icon [name]="service.icon" size="22" />
              </span>
              <h2 class="mt-4 text-xl font-semibold">{{ service.title }}</h2>
              <p class="mt-2 text-gray-600 dark:text-gray-300">{{ service.text }}</p>
              <a [routerLink]="service.link" class="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300">
                {{ service.cta }} <ng-icon name="lucideArrowRight" size="16" />
              </a>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class ServicesPage {
  protected readonly services = [
    {
      title: 'Accessories retail',
      text: 'A wide variety of gaming peripherals including keyboards, mice, headsets, controllers, and more.',
      image: 'Images/Services/retail.png',
      icon: 'lucideStore',
      link: '/products',
      cta: 'Browse products',
    },
    {
      title: 'Repair',
      text: 'Reliable repair service for damaged or malfunctioning gaming devices with quality assurance.',
      image: 'Images/Services/repair.png',
      icon: 'lucideWrench',
      link: '/contact',
      cta: 'Book a repair',
    },
    {
      title: 'Gaming setup consultation',
      text: 'Personalized advice and planning to build the perfect gaming environment for individuals or companies.',
      image: 'Images/Services/consult.png',
      icon: 'lucideMessagesSquare',
      link: '/contact',
      cta: 'Get advice',
    },
  ];
}
