// =====================================================================
//  UTISCI GOSTIJU - ovde se rucno unose.
// =====================================================================
//
//  Svaki utisak je jedan blok u viticastim zagradama { ... }, a blokovi
//  su odvojeni zarezom. Redosled ovde = redosled na sajtu.
//
//  Polja:
//    name  - ime gosta, npr. "Milica J." ili "Nenad i Ana"
//    city  - grad; moze i prazno: ""
//    date  - slobodan tekst, npr. "Avgust 2024."
//    text  - sam utisak. Navodnike ne pisi - sajt crta veliki znak navoda sam.
//            Ako u tekstu treba obican navodnik ", napisi ga kao \"
//
//  Primer:
//    {
//      name: "Jelena M.",
//      city: "Beograd",
//      date: "Jul 2025.",
//      text: "Stan je besprekorno čist, a terasa je bila najlepši deo boravka.",
//    },
//
//  - Sa samo 1 utiskom sakrivaju se tackice i strelice.
//  - Ako obrises sve utiske (ostane prazno: [ ]), sekcija i link "utisci"
//    u meniju nestaju sami.
//
//  !!! Cetiri utiska ispod su IZMISLJENI PRIMERI - zameni ih pravim. !!!

export const testimonials = [
  {
    name: "Ljubisa",
    city: "",
    date: "Maj 2026.",
    text: "Jedan od najboljih i najopremljenijih apartmana u kojem smo bili. Sve je novo i čisto. Aparman izuzetno funkcionalan. Kuhinja opremljena svim uredjajima i sudovima koji se mogu zamisliti, kao da cemo da živimo tu a ne da ostanemo par dana.",
  },

  {
    name: "Mirela",
    city: "",
    date: "Septembar 2025.",
    text: "Sve je savrseno cisto, apartman je u centru grada, sve je dostupno peske. Komunikacija sa vlasnicom je za svaku pohvalu. Licno nas je docekala i prilagodila stan za bebu sto nam je mnogo znacilo. Rado cemo se vratiti!",
  },
  {
    name: "Pantelić",
    city: "",
    date: "Avgust 2025.",
    text: "Apartman je cist, uredan, ima sve sto treba i na dobroj lokaciji. Vlasnica je jako vedra osoba i spremna na svaki vid dogovora. Samo reci hvale od nase porodice 😁",
  },
  {
    name: "Milan",
    city: "",
    date: "Jul 2025.",
    text: "Apartman je čist i na mirnom je mestu, žena koja nas je dočekala bila je ljubazna i sve nam je lepo objasnila, topla preporuka za ovaj apartman. 👍",
  },
];
