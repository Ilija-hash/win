import { CONTACT } from "../data/site";

// Svaki "Rezerviši" CTA na sajtu ide kroz ovu funkciju.
// Za sada je to poziv telefonom; kasnije forma za upit + Supabase.
export function getBookingHref() {
  return CONTACT.phoneHref;
}
