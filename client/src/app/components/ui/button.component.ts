import { Component, computed, input } from '@angular/core';

type Variant = 'primary' | 'accent' | 'secondary';

const STYLES: Record<Variant, string> = {
  primary: 'bg-nuit text-papier hover:bg-nuit/90 hover:shadow-md shadow-xs',
  accent: 'bg-soleil text-nuit hover:brightness-95 hover:shadow-md shadow-xs font-bold',
  secondary: 'border border-ardoise/30 bg-white text-nuit hover:bg-papier hover:border-nuit shadow-2xs',
};

/**
 * Bouton de la charte. S'utilise directement sur un <button> ou un <a> :
 *   <button app-button variant="accent" type="submit">Rechercher</button>
 * Style moderne en pilule (rounded-full) sans angles vifs.
 */
@Component({
  selector: 'button[app-button], a[app-button]',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class ButtonComponent {
  readonly variant = input<Variant>('primary');

  protected readonly classes = computed(
    () => `inline-flex items-center justify-center min-h-11 rounded-full px-5 text-sm font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${STYLES[this.variant()]}`,
  );
}
