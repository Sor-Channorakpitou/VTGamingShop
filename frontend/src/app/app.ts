import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './layout/footer';
import { Header } from './layout/header';
import { Toaster } from './layout/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Toaster],
  template: `
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 btn btn-secondary"
      >Skip to content</a
    >
    <div class="flex min-h-dvh flex-col">
      <app-header />
      <main id="main" class="flex-1">
        <router-outlet />
      </main>
      <app-footer />
    </div>
    <app-toaster />
  `,
})
export class App {}
