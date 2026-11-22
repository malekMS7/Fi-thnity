import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-modal',
  imports: [ButtonComponent],
  template: `
    @if (isOpen) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <!-- Backdrop sombre avec flou -->
        <div
          class="fixed inset-0 bg-nuit/60 backdrop-blur-xs transition-opacity"
          (click)="onCancel()"
        ></div>

        <!-- Boîte de dialogue -->
        <div
          class="relative w-full max-w-md rounded-charte border-2 border-nuit bg-papier p-6 shadow-xl transition-all"
        >
          <div class="flex items-start justify-between">
            <h2 [id]="titleId" class="text-xl font-titre font-bold text-nuit">
              {{ title }}
            </h2>
            <button
              type="button"
              (click)="onCancel()"
              class="flex h-8 w-8 items-center justify-center rounded-charte text-ardoise hover:bg-filet/50 hover:text-nuit"
              aria-label="Fermer la boîte de dialogue"
            >
              ✕
            </button>
          </div>

          <div class="mt-3 text-sm text-ardoise leading-relaxed">
            <ng-content />
          </div>

          <div class="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              app-button
              variant="secondary"
              type="button"
              (click)="onCancel()"
            >
              {{ cancelText }}
            </button>
            <button
              app-button
              [variant]="confirmVariant"
              type="button"
              (click)="onConfirm()"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmation';
  @Input() confirmText = 'Confirmer';
  @Input() cancelText = 'Annuler';
  @Input() confirmVariant: 'primary' | 'accent' | 'secondary' = 'primary';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  protected readonly titleId = `modal-title-${Math.random().toString(36).slice(2, 7)}`;

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onCancel();
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
