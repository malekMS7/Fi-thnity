import { Injectable, inject } from '@angular/core';
import type { Role, User } from '../types';
import { ApiService } from './api.service';

export interface RegisterInput {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
}

const toUser = (u: { id: string; name: string; email: string; phone?: string; role: Role }): User => ({
  id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role,
});

/** Inscription / connexion via l'API Express. L'état de la session est dans SessionService. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  async register(input: RegisterInput): Promise<{ token: string; user: User }> {
    const { token, user } = await this.api.auth.register(input);
    return { token, user: toUser(user) };
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { token, user } = await this.api.auth.login(email, password);
    return { token, user: toUser(user) };
  }
}