import { Injectable, computed, signal } from '@angular/core';
import type { User } from '../types';

interface Stored {
  token: string | null;
  user: User | null;
}

const KEY = 'fithnity-auth';

function readStored(): Stored {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

/**
 * Remplace AuthContext / useAuth() de la version React.
 * Même clé localStorage ("fithnity-auth") : une session existante reste valable.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly state = signal<Stored>(readStored());

  readonly user = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);

  login(token: string, user: User): void {
    this.state.set({ token, user });
    localStorage.setItem(KEY, JSON.stringify({ token, user }));
  }

  logout(): void {
    this.state.set({ token: null, user: null });
    localStorage.removeItem(KEY);
  }
}
