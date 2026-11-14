/**
 * Base de données SIMULÉE, stockée dans le navigateur (localStorage).
 * Elle sera remplacée par l'API Express + PostgreSQL : seuls les fichiers
 * de ce dossier "services" devront changer, pas les pages.
 */
import { Injectable } from '@angular/core';
import type { Booking, Review, Role } from '../types';

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  password: string; // en clair : uniquement pour la simulation !
}

export interface StoredRide {
  id: string;
  driverId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seats: number;
  price: number;
  meetingPoint: string;
  options: string[];
}

export interface DB {
  users: StoredUser[];
  rides: StoredRide[];
  bookings: Booking[];
  reviews: Review[];
}

const KEY = 'fithnity-db-v1';

function inDays(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  const pad = (x: number) => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function seed(): DB {
  const pwd = 'demo1234';
  const users: StoredUser[] = [
    { id: 'u1', name: 'Walid B.', email: 'walid@demo.tn', role: 'DRIVER', password: pwd },
    { id: 'u2', name: 'Ines M.', email: 'ines@demo.tn', role: 'DRIVER', password: pwd },
    { id: 'u3', name: 'Karim T.', email: 'karim@demo.tn', role: 'DRIVER', password: pwd },
    { id: 'u4', name: 'Yosra A.', email: 'yosra@demo.tn', role: 'DRIVER', password: pwd },
    { id: 'u5', name: 'Sarra K.', email: 'sarra@demo.tn', role: 'PASSENGER', password: pwd },
  ];
  const r = (id: string, driverId: string, from: string, to: string, day: number, time: string, seats: number, price: number, meetingPoint: string, options: string[]): StoredRide =>
    ({ id, driverId, from, to, date: inDays(day), time, seats, price, meetingPoint, options });
  const rides: StoredRide[] = [
    r('r1', 'u1', 'Sfax', 'Tunis', 2, '07:30', 4, 18, 'Gare routière de Sfax', ['Petit bagage', 'Non-fumeur']),
    r('r2', 'u2', 'Sfax', 'Tunis', 2, '08:15', 3, 20, 'Campus universitaire de Sfax', ['Non-fumeur']),
    r('r3', 'u3', 'Sfax', 'Tunis', 2, '14:00', 3, 17, 'Station Sfax Centre', ['Musique', 'Petit bagage']),
    r('r4', 'u4', 'Sfax', 'Tunis', 2, '17:30', 4, 18, 'Gare routière de Sfax', ['Non-fumeur']),
    r('r5', 'u2', 'Sousse', 'Monastir', 1, '08:00', 3, 4, 'Place Farhat Hached', ['Non-fumeur']),
    r('r6', 'u3', 'Tunis', 'Sousse', 3, '10:00', 4, 12, 'Station Bab Saadoun', ['Petit bagage']),
    r('r7', 'u1', 'Tunis', 'Sfax', 3, '10:00', 4, 18, 'Station Bab Saadoun', ['Non-fumeur']),
    r('r8', 'u4', 'Tunis', 'Bizerte', 4, '16:30', 3, 7, 'Place de la République', ['Musique']),
    r('r9', 'u3', 'Nabeul', 'Tunis', 1, '07:00', 2, 8, 'Gare de Nabeul', ['Petit bagage', 'Non-fumeur']),
  ];
  const reviews: Review[] = [
    { id: 'v1', driverId: 'u1', authorName: 'Sarra', rating: 5, comment: 'Ponctuel et sympa, voiture propre.' },
    { id: 'v2', driverId: 'u1', authorName: 'Amine', rating: 5, comment: 'Trajet très agréable, je recommande.' },
    { id: 'v3', driverId: 'u1', authorName: 'Mariem', rating: 4, comment: 'Départ à l\'heure, conduite prudente.' },
    { id: 'v4', driverId: 'u2', authorName: 'Houssem', rating: 5, comment: 'Très organisée, communication claire.' },
    { id: 'v5', driverId: 'u2', authorName: 'Rim', rating: 4, comment: 'Bien passé, merci !' },
    { id: 'v6', driverId: 'u3', authorName: 'Oussama', rating: 5, comment: 'Parfait, prix honnête.' },
    { id: 'v7', driverId: 'u4', authorName: 'Nour', rating: 5, comment: 'Conductrice sérieuse et agréable.' },
    { id: 'v8', driverId: 'u4', authorName: 'Firas', rating: 4, comment: 'Trajet confortable.' },
  ];
  return { users, rides, bookings: [], reviews };
}

@Injectable({ providedIn: 'root' })
export class DbService {
  load(): DB {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw) as DB;
    } catch {
      /* on retombe sur les données de démonstration */
    }
    const db = seed();
    this.save(db);
    return db;
  }

  save(db: DB): void {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  newId(prefix: string): string {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }
}
