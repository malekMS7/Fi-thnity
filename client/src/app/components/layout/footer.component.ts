import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  host: { class: 'block' },
  template: `
    <footer class="border-t border-filet py-6 text-center text-sm text-ardoise">
      © Fi thnity · Projet Web SUP'COM · Groupe 11
    </footer>
  `,
})
export class FooterComponent {}
