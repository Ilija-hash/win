// Jedno mesto za sav sadrzaj sajta. Kasnije ovo dolazi iz Supabase-a
// (admin panel), pa komponente ne treba da znaju odakle stize.

import { testimonials } from "./testimonials";

export const CONTACT = {
  phone: "0611187040",
  phoneHref: "tel:0611187040",
  email: "win.sokobanja@gmail.com",
  address: "Prevalac 9, Sokobanja",
  instagram: "@win_sokobanja",
  instagramHref: "https://instagram.com/win_sokobanja",
  mapsLink: "https://www.google.com/maps/search/?api=1&query=Prevalac+9%2C+Sokobanja",
  mapsEmbed: "https://www.google.com/maps?q=Prevalac+9,+Sokobanja&output=embed",
};

// Sekcije za meni. `id` mora da se poklapa sa id-jem <section> elementa.
// "utisci" se sakriva kada u testimonials.js nema nijednog utiska.
export const NAV = [
  { id: "o-stanu", label: "o stanu" },
  { id: "galerija", label: "galerija" },
  { id: "sadrzaj", label: "sadržaj" },
  { id: "utisci", label: "utisci" },
  { id: "kontakt", label: "kontakt" },
].filter((item) => item.id !== "utisci" || testimonials.length > 0);

// `icon` je kljuc iz src/components/Icons.jsx.
export const AMENITIES = [
  { icon: "wifi", title: "Wi-Fi", text: "Brz internet u celom stanu." },
  { icon: "ac", title: "Klima", text: "Prijatno i u najtoplijim danima." },
  { icon: "tv", title: "Smart TV", text: "Za večeri kada se ostaje unutra." },
  { icon: "elevator", title: "Lift", text: "Bez nošenja kofera uz stepenice." },
  { icon: "washer", title: "Veš mašina", text: "Za duže boravke bez brige." },
  { icon: "dishwasher", title: "Mašina za sudove", text: "Bez pranja sudova na odmoru." },
  { icon: "parking", title: "Parking", text: "Mesto za auto blizu zgrade." },
  { icon: "park", title: "Park u blizini", text: "Park Banjica na par koraka." },
];

// Sobe u galeriji. `folders` = folderi u src/assets/gallery koji pripadaju sobi,
// `cover` = izdvojena slika (folder/slug) koja otvara slider te sobe.
// Folder "trepezarija" je zateceno ime; labela je ispravna.
export const ROOMS = [
  { id: "dnevna", label: "Dnevna soba", folders: ["dnevna"], cover: "dnevna/20240412_155252" },
  { id: "spavaca", label: "Spavaća soba", folders: ["spavaca"], cover: "spavaca/20240410_143032" },
  { id: "kuhinja", label: "Kuhinja", folders: ["kuhinja"], cover: "kuhinja/20240412_154924" },
  { id: "trpezarija", label: "Trpezarija", folders: ["trepezarija"], cover: "trepezarija/20240412_163252" },
  { id: "kupatilo", label: "Kupatilo", folders: ["kupatilo"], cover: "kupatilo/20240412_173012" },
  { id: "terasa", label: "Terasa", folders: ["terasa"], cover: "terasa/20240927_151039" },
  { id: "zgrada", label: "Zgrada i ulaz", folders: ["zgrada", "hodnik", "lift"], cover: "zgrada/20240526_164915" },
];
