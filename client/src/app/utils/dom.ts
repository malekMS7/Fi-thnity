/** Valeur d'un <input> / <select> à partir de l'événement DOM (équivalent de e.target.value en React). */
export const inputValue = (e: Event): string => (e.target as HTMLInputElement | HTMLSelectElement).value;
