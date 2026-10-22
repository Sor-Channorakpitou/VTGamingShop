import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toaster',
  imports: [NgIcon, RouterLink],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:items-end"
      aria-live="polite"
      role="status"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="anim-enter card pointer-events-auto flex w-full max-w-sm items-start gap-3 p-4 shadow-xl"
          animate.leave="anim-leave"
        >
          <span
            class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full"
            [class]="
              toast.kind === 'success'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                : toast.kind === 'error'
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
            "
          >
            <ng-icon
              [name]="toast.kind === 'success' ? 'lucideCheck' : toast.kind === 'error' ? 'lucideCircleAlert' : 'lucideSparkles'"
              size="14"
            />
          </span>
          <p class="flex-1 text-sm">{{ toast.message }}</p>
          @if (toast.action; as action) {
            <a
              [routerLink]="action.link"
              class="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-300"
              (click)="toasts.dismiss(toast.id)"
              >{{ action.label }}</a
            >
          }
          <button
            type="button"
            class="-m-1 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Dismiss"
            (click)="toasts.dismiss(toast.id)"
          >
            <ng-icon name="lucideX" size="16" />
          </button>
        </div>
      }
    </div>
  `,
})
export class Toaster {
  protected readonly toasts = inject(ToastService);
}
