import { Injectable, inject } from '@angular/core';
import type { Role, User } from '../types';
import { DbService } from './db.service';

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

/** Inscription / connexion (simulées). L'état de la session est dans SessionService. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly dbService = inject(DbService);

  async register(input: RegisterInput): Promise<{ token: string; user: User }> {
    const db = this.dbService.load();
    const email = input.email.trim().toLowerCase();
    if (db.users.some((u) => u.email === email)) throw new Error('Un compte existe déjà avec cet email.');
    const stored = { id: this.dbService.newId('u'), ...input, name: input.name.trim(), email };
    db.users.push(stored);
    this.dbService.save(db);
    return { token: `token-${stored.id}`, user: toUser(stored) };
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const db = this.dbService.load();
    const found = db.users.find((u) => u.email === email.trim().toLowerCase() && u.password === password);
    if (!found) throw new Error('Email ou mot de passe incorrect.');
    return { token: `token-${found.id}`, user: toUser(found) };
  }
}
