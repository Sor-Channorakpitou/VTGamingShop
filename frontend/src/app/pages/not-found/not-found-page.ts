import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <div class="page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p class="bg-linear-to-r from-brand-600 to-brand-accent bg-clip-text text-7xl font-extrabold text-transparent">404</p>
      <h1 class="mt-4 text-2xl font-bold">Page not found</h1>
      <p class="mt-2 text-gray-500 dark:text-gray-400">The page you're looking for doesn't exist or has moved.</p>
      <div class="mt-6 flex gap-2">
        <a routerLink="/" class="btn btn-primary">Go home</a>
        <a routerLink="/products" class="btn btn-secondary">Browse products</a>
      </div>
    </div>
  `,
})
export class NotFoundPage {}
