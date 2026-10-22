import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/toast.service';

/** Keycloak sends the browser here after login or signup. */
@Component({
  selector: 'app-callback-page',
  imports: [RouterLink, NgIcon],
  template: `
    <div class="page flex min-h-[60vh] items-center justify-center py-16">
      <div class="card w-full max-w-md p-10 text-center">
        @if (error(); as message) {
          <span class="mx-auto flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
            <ng-icon name="lucideCircleAlert" size="22" />
          </span>
          <h1 class="mt-4 text-lg font-semibold">We couldn't sign you in</h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{{ message }}</p>
          <div class="mt-6 flex justify-center gap-2">
            <button type="button" class="btn btn-primary" (click)="auth.login('/')">Try again</button>
            <a routerLink="/" class="btn btn-secondary">Go home</a>
          </div>
        } @else {
          <ng-icon name="lucideLoaderCircle" size="32" class="animate-spin text-brand-600" />
          <p class="mt-4 font-medium">Signing you in…</p>
        }
      </div>
    </div>
  `,
})
export class CallbackPage implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastService);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const returnUrl = await this.auth.completeLogin(location.search);
      this.toasts.success(`Welcome, ${this.auth.user()?.firstName || this.auth.user()?.name}!`);
      await this.router.navigateByUrl(returnUrl, { replaceUrl: true });
    } catch (error) {
      console.error(error);
      this.error.set(error instanceof Error ? error.message : 'Sign-in failed.');
    }
  }
}
