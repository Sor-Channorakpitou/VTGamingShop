import { Component, computed, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-star-rating',
  imports: [NgIcon],
  template: `
    <span class="inline-flex items-center gap-0.5" [attr.aria-label]="rating() + ' out of 5 stars'" role="img">
      @for (filled of stars(); track $index) {
        <ng-icon
          name="lucideStar"
          [size]="size()"
          [class]="filled ? 'text-amber-400 [&_svg]:fill-current' : 'text-gray-300 dark:text-gray-600'"
        />
      }
    </span>
  `,
})
export class StarRating {
  readonly rating = input.required<number>();
  readonly size = input('16');

  protected readonly stars = computed(() =>
    Array.from({ length: 5 }, (_, i) => i < Math.round(this.rating())),
  );
}
