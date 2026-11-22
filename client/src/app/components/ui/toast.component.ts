import { Component, inject } from '@angular/core';
import { ToastService, ToastType } from '../../core/toast.service';

@Component({
  selector: 'app-toast-container',
  host: { class: 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4' },
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div
        role="status"
        aria-live="polite"
        [class]="containerClass(toast.type)"
        class="pointer-events-auto flex items-start justify-between gap-3 rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
      >
        <div class="flex items-start gap-2.5">
          <span class="text-base leading-none">{{ iconFor(toast.type) }}</span>
          <p class="text-xs font-medium leading-relaxed">{{ toast.text }}</p>
        </div>
        <button
          type="button"
          (click)="toastService.dismiss(toast.id)"
          class="text-xs font-bold opacity-60 hover:opacity-100"
          aria-label="Fermer la notification"
        >
          ✕
        </button>
      </div>
    }
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);

  protected iconFor(type: ToastType): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
    }
  }

  protected containerClass(type: ToastType): string {
    switch (type) {
      case 'success':
        return 'border-menthe bg-papier text-nuit';
      case 'error':
        return 'border-corail bg-white text-corail font-semibold';
      case 'info':
        return 'border-soleil bg-white text-nuit';
    }
  }
}
