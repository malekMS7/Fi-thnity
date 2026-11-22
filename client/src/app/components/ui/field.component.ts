import { Component, booleanAttribute, computed, input, model } from '@angular/core';
import { inputValue } from '../../utils/dom';

let nextId = 0;

/**
 * Champ de formulaire : libellé visible + message d'erreur commençant par « Error ».
 * Valeur liée avec [value] / (valueChange), ou [(value)] :
 *   <app-field label="Email" type="email" [value]="email()" (valueChange)="email.set($event)" />
 */
@Component({
  selector: 'app-field',
  host: { class: 'block' },
  template: `
    <label [attr.for]="id" class="block text-sm font-medium">
      {{ label() }}
      @if (required()) {
        <span class="text-corail font-bold ml-0.5" aria-hidden="true">*</span>
      }
    </label>
    <input
      [id]="id"
      [type]="type()"
      [value]="value()"
      (input)="value.set(inputValue($event))"
      [required]="required()"
      [attr.min]="min()"
      [attr.max]="max()"
      [attr.autocomplete]="autocomplete()"
      [attr.list]="list()"
      [attr.aria-invalid]="!!error()"
      [attr.aria-describedby]="error() ? id + '-err' : null"
      [class]="inputClass()"
    />
    @if (error()) {
      <p [id]="id + '-err'" class="mt-1 text-sm text-corail">Error : {{ error() }}</p>
    }
  `,
})
export class FieldComponent {
  readonly label = input.required<string>();
  readonly type = input('text');
  readonly error = input<string | undefined>();
  readonly min = input<string | number | null>(null);
  readonly max = input<string | number | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly list = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly value = model('');

  protected readonly id = `field-${nextId++}`;
  protected readonly inputValue = inputValue;

  protected readonly inputClass = computed(
    () => `mt-1 min-h-11 w-full rounded-charte border bg-white px-3 ${this.error() ? 'border-corail' : 'border-ardoise'}`,
  );
}
