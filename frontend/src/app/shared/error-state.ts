import { Component, input, output } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-error-state',
  imports: [NgIcon],
  template: `
    <div class="card flex flex-col items-center gap-3 px-6 py-14 text-center" role="alert">
      <span class="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300">
        <ng-icon name="lucideTriangleAlert" size="22" />
      </span>
      <h2 class="text-lg font-semibold">{{ title() }}</h2>
      <p class="max-w-md text-sm text-gray-500 dark:text-gray-400">{{ message() }}</p>
      <button type="button" class="btn btn-secondary mt-2" (click)="retry.emit()">
        <ng-icon name="lucideRefreshCw" size="16" /> Try again
      </button>
    </div>
  `,
})
export class ErrorState {
  readonly title = input('Something went wrong');
  readonly message = input("We couldn't reach the shop just now. Check your connection and try again.");
  readonly retry = output();
}
