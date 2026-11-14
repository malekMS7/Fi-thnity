import { Component, computed, input } from '@angular/core';

type Variant = 'primary' | 'accent' | 'secondary';

const STYLES: Record<Variant, string> = {
  primary: 'bg-nuit text-papier hover:bg-nuit/90',
  accent: 'bg-soleil text-nuit hover:brightness-95',
  secondary: 'border border-nuit text-nuit hover:bg-nuit/5',
};

/**
 * Bouton de la charte. S'utilise directement sur un <button> :
 *   <button app-button variant="accent" type="submit">Rechercher</button>
 * Les classes ajoutées sur la balise (ex. class="w-full") sont conservées.
 */
@Component({
  selector: 'button[app-button]',
  host: { '[class]': 'classes()' },
  template: '<ng-content />',
})
export class ButtonComponent {
  readonly variant = input<Variant>('primary');

  protected readonly classes = computed(
    () => `min-h-11 rounded-charte px-4 text-sm font-semibold transition disabled:opacity-50 ${STYLES[this.variant()]}`,
  );
}
