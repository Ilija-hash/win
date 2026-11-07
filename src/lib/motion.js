/** Korisnik je u sistemu iskljucio animacije - sve animacije tada traju 0s. */
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
