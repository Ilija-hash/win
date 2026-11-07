// Velike verzije fotografija (lightbox): telefon/tablet dobija 1200px, veci ekrani 1600px.
// `mid` uvek postoji - Gallery ga puni sa `full` ako 1200 verzija fali.
export const largeSrcSet = (photo) => `${photo.mid} 1200w, ${photo.full} 1600w`;

/** Skida veliku verziju unapred, da se u lightbox-u otvori bez cekanja. */
export function preloadPhoto(photo) {
  const image = new Image();
  image.sizes = "100vw";
  image.srcset = largeSrcSet(photo);
  image.src = photo.full;
}
