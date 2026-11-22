import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';
import { FieldComponent } from '../components/ui/field.component';
import { inputValue } from '../utils/dom';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FaqItem {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-contact',
  imports: [RouterLink, ButtonComponent, FieldComponent],
  host: { class: 'block' },
  template: `
    <section>
      <!-- En-tête -->
      <div class="max-w-2xl">
        <p class="text-xs font-bold uppercase tracking-widest text-corail">Contact & Assistance</p>
        <h1 class="mt-1 text-3xl font-titre md:text-4xl">Une question ? Nous sommes là pour toi.</h1>
        <p class="mt-3 text-ardoise leading-relaxed">
          Que tu sois étudiant ou jeune actif, l'équipe Fi thnity est à ton écoute pour t'accompagner dans tes trajets quotidiens et interurbains.
        </p>
      </div>

      <!-- Grille principale : Formulaire + Coordonnées -->
      <div class="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <!-- Formulaire de contact -->
        <div class="rounded-charte border border-filet bg-white p-6 shadow-xs">
          <h2 class="text-xl font-titre font-semibold text-nuit">Envoie-nous un message</h2>
          <p class="mt-1 text-sm text-ardoise">Remplis le formulaire ci-dessous, notre équipe te répondra sous 24h ouvrées.</p>

          @if (submitted()) {
            <div role="status" class="mt-6 rounded-charte border border-menthe/30 bg-menthe/10 p-4 text-menthe">
              <p class="font-semibold">Message envoyé avec succès !</p>
              <p class="mt-1 text-sm text-nuit">
                Merci {{ form().name }}, nous avons bien reçu ton message concernant « {{ form().subject || 'ta demande' }} ». Nous te répondrons à l'adresse <b>{{ form().email }}</b> très prochainement.
              </p>
              <button
                type="button"
                (click)="resetForm()"
                class="mt-4 inline-flex text-xs font-semibold uppercase tracking-wider underline decoration-menthe decoration-2 underline-offset-4"
              >
                Envoyer un autre message
              </button>
            </div>
          } @else {
            <form (submit)="handleSubmit($event)" novalidate class="mt-6 space-y-4">
              <app-field
                label="Nom complet"
                [value]="form().name"
                (valueChange)="setField('name', $event)"
                [error]="errors().name"
                autocomplete="name"
                required
              />

              <app-field
                label="Adresse email"
                type="email"
                [value]="form().email"
                (valueChange)="setField('email', $event)"
                [error]="errors().email"
                autocomplete="email"
                required
              />

              <div>
                <label for="contact-subject" class="block text-sm font-medium">Sujet de ta demande</label>
                <select
                  id="contact-subject"
                  [value]="form().subject"
                  (change)="setField('subject', inputValue($event))"
                  class="mt-1 min-h-11 w-full rounded-charte border border-ardoise bg-white px-3 text-sm focus:border-soleil"
                >
                  <option value="Question générale sur un trajet">Question générale sur un trajet</option>
                  <option value="Problème avec une réservation">Problème avec une réservation</option>
                  <option value="Signaler un comportement ou un conducteur">Signaler un comportement ou un conducteur</option>
                  <option value="Partenariat / collaboration">Partenariat / collaboration</option>
                  <option value="Autre demande">Autre demande</option>
                </select>
              </div>

              <div>
                <label for="contact-message" class="block text-sm font-medium">Ton message</label>
                <textarea
                  id="contact-message"
                  rows="5"
                  [value]="form().message"
                  (input)="setField('message', inputValue($event))"
                  placeholder="Explique-nous en détail comment nous pouvons t'aider…"
                  class="mt-1 w-full rounded-charte border bg-white p-3 text-sm focus:border-soleil"
                  [class]="errors().message ? 'border-corail' : 'border-ardoise'"
                ></textarea>
                @if (errors().message) {
                  <p class="mt-1 text-sm text-corail">Error : {{ errors().message }}</p>
                }
              </div>

              <button app-button type="submit" variant="accent" class="w-full sm:w-auto">
                Envoyer mon message
              </button>
            </form>
          }
        </div>

        <!-- Coordonnées du projet -->
        <div class="space-y-6">
          <div class="rounded-charte border border-filet bg-papier p-6">
            <h2 class="text-lg font-titre font-bold text-nuit">Notre siège</h2>
            <p class="mt-2 text-sm text-ardoise leading-relaxed">
              Fi thnity est une initiative tunisienne pensée pour rendre les trajets quotidiens plus simples et plus solidaires.
            </p>

            <ul class="mt-4 space-y-3 text-sm">
              <li class="flex items-start gap-3">
                <span class="mt-0.5 text-base">📍</span>
                <div>
                  <p class="font-semibold text-nuit">Technopôle El Ghazala</p>
                  <p class="text-ardoise">Route de Raoued, 2088 Ariana, Tunisie</p>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 text-base">✉️</span>
                <div>
                  <p class="font-semibold text-nuit">Email d'assistance</p>
                  <a href="mailto:contact@fithnity.tn" class="text-menthe underline decoration-menthe">contact&#64;fithnity.tn</a>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <span class="mt-0.5 text-base">⏱️</span>
                <div>
                  <p class="font-semibold text-nuit">Permanence support</p>
                  <p class="text-ardoise">Lundi au Vendredi · 8h30 - 18h00</p>
                </div>
              </li>
            </ul>
          </div>

          <div class="rounded-charte border border-soleil/40 bg-soleil/10 p-5">
            <p class="font-titre text-sm font-bold text-nuit">Besoin d'un trajet urgent ?</p>
            <p class="mt-1 text-xs text-ardoise leading-relaxed">
              Consulte en priorité la liste des trajets publiés aujourd'hui pour contacter directement un conducteur disponible.
            </p>
            <a routerLink="/trajets" class="mt-3 inline-block text-xs font-semibold uppercase tracking-wider text-nuit underline decoration-soleil decoration-2 underline-offset-4">
              Consulter les départs immédiats →
            </a>
          </div>
        </div>
      </div>

      <!-- FAQ interactive -->
      <div class="mt-14 max-w-4xl">
        <p class="text-xs font-bold uppercase tracking-widest text-corail">Foire aux questions</p>
        <h2 class="mt-1 text-2xl font-titre font-semibold">Questions fréquemment posées</h2>

        <div class="mt-6 divide-y divide-filet border-y border-filet">
          @for (faq of faqs(); track faq.question; let idx = $index) {
            <div class="py-4">
              <button
                type="button"
                (click)="toggleFaq(idx)"
                class="flex w-full items-center justify-between text-left font-titre text-base font-semibold text-nuit hover:text-menthe focus:outline-hidden"
                [attr.aria-expanded]="faq.open"
              >
                <span>{{ faq.question }}</span>
                <span class="ml-4 text-xl font-bold transition-transform duration-200" [class.rotate-45]="faq.open">+</span>
              </button>
              @if (faq.open) {
                <div class="mt-2 text-sm text-ardoise leading-relaxed">
                  <p>{{ faq.answer }}</p>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  protected readonly form = signal<ContactForm>({
    name: '',
    email: '',
    subject: 'Question générale sur un trajet',
    message: '',
  });

  protected readonly errors = signal<Partial<Record<keyof ContactForm, string>>>({});
  protected readonly submitted = signal(false);
  protected readonly inputValue = inputValue;

  protected readonly faqs = signal<FaqItem[]>([
    {
      question: 'Comment s\'effectue le règlement des trajets ?',
      answer: 'Fi thnity favorise la simplicité et la confiance mutuelle : le prix affiché est forfaitaire et partagé. Le paiement des frais s\'effectue de main à main directement auprès du conducteur au point de rendez-vous ou à la montée dans le véhicule.',
      open: false,
    },
    {
      question: 'Puis-je annuler ma réservation en cas d\'imprévu ?',
      answer: 'Oui, tout passager peut annuler sans pénalité depuis son « Tableau de bord » avant l\'heure de départ prévue. Les places réservées sont immédiatement remises à disposition des autres étudiants et voyageurs.',
      open: false,
    },
    {
      question: 'Comment fonctionne le système d\'évaluation et d\'avis ?',
      answer: 'Chaque conducteur dispose d\'une fiche transparente affichant sa note moyenne sur 5 étoiles ainsi que les avis récents laissés par les passagers (ponctualité, propreté, confort de conduite).',
      open: false,
    },
    {
      question: 'La plateforme est-elle réservée uniquement aux étudiants de SUP\'COM ?',
      answer: 'Non, bien que le projet soit né à SUP\'COM pour fluidifier les déplacements entre le pôle El Ghazala et les différentes régions tunisiennes, la plateforme est ouverte à tous les étudiants universitaires et aux actifs désireux de covoiturer.',
      open: false,
    },
  ]);

  protected setField(key: keyof ContactForm, value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  protected toggleFaq(index: number): void {
    this.faqs.update((items) =>
      items.map((item, idx) => (idx === index ? { ...item, open: !item.open } : item)),
    );
  }

  protected resetForm(): void {
    this.form.set({
      name: '',
      email: '',
      subject: 'Question générale sur un trajet',
      message: '',
    });
    this.errors.set({});
    this.submitted.set(false);
  }

  protected handleSubmit(e: Event): void {
    e.preventDefault();
    const f = this.form();
    const errs: Partial<Record<keyof ContactForm, string>> = {};

    if (!f.name.trim() || f.name.trim().length < 2) {
      errs.name = 'Merci d\'indiquer ton nom complet.';
    }
    if (!/^\S+@\S+\.\S+$/.test(f.email)) {
      errs.email = 'Merci de fournir une adresse email valide.';
    }
    if (!f.message.trim() || f.message.trim().length < 10) {
      errs.message = 'Ton message doit comporter au moins 10 caractères.';
    }

    this.errors.set(errs);
    if (Object.keys(errs).length === 0) {
      this.submitted.set(true);
    }
  }
}
