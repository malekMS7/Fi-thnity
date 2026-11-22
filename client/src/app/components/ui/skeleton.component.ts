import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  host: {
    '[class]': 'classes()',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
  template: '',
})
export class SkeletonComponent {
  readonly width = input<string>('100%');
  readonly height = input<string>('1rem');
  readonly rounded = input<string>('rounded-charte');
  readonly className = input<string>('');

  protected readonly classes = computed(
    () => `block animate-pulse bg-filet/70 ${this.rounded()} ${this.className()}`,
  );
}
