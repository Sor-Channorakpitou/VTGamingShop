import { Component, input } from '@angular/core';

/** How many are left, in words. */
@Component({
  selector: 'app-stock-label',
  template: `
    @if (stock() === 0) {
      <span class="badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">Out of stock</span>
    } @else if (stock() <= 5) {
      <span class="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
        >Only {{ stock() }} left</span
      >
    } @else {
      <span class="badge bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">In stock</span>
    }
  `,
})
export class StockLabel {
  readonly stock = input.required<number>();
}
