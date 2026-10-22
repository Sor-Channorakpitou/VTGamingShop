import { Component, input, model } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-quantity-stepper',
  imports: [NgIcon],
  template: `
    <div
      class="inline-flex items-center rounded-xl ring-1 ring-gray-300 dark:ring-gray-700"
      role="group"
      [attr.aria-label]="'Quantity for ' + label()"
    >
      <button
        type="button"
        class="icon-btn size-9! rounded-r-none!"
        [disabled]="value() <= min()"
        (click)="value.set(value() - 1)"
        aria-label="Decrease quantity"
      >
        <ng-icon name="lucideMinus" size="16" />
      </button>
      <span class="w-9 text-center text-sm font-semibold tabular-nums" aria-live="polite">{{ value() }}</span>
      <button
        type="button"
        class="icon-btn size-9! rounded-l-none!"
        [disabled]="value() >= max()"
        (click)="value.set(value() + 1)"
        aria-label="Increase quantity"
      >
        <ng-icon name="lucidePlus" size="16" />
      </button>
    </div>
  `,
})
export class QuantityStepper {
  readonly value = model.required<number>();
  readonly min = input(1);
  readonly max = input(99);
  readonly label = input('item');
}
