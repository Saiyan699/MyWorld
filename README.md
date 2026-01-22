# 🤖 KodSaketa Discord Bot

## 📌 Osnovne informacije
- **Platforma:** Discord.js (Node.js)
- **Namjena:** Upravljanje serverom sa naprednim funkcionalnostima
- **Glavne karakteristike:** Leveling sistem, AI integracija, zaštita od spama, automatski odgovori, upravljanje glasovnim kanalima

### 🧠 AI Konverzacija (Groq)
Bot sada podržava vještačku inteligenciju putem Groq API-ja.
* **Kako pričati sa AI:** Taguj bota u bilo kojem kanalu i napiši pitanje.
* **Primjer:** `@Bot ko je liveSake.`

### 🚨 Poboljšana Spam Zaštita
* **Tekst i Slike:** Bot sada detektuje ako neko šalje istu poruku ili **istu sliku** više od 3 puta zaredom.
* **Kazna:** Automatsko brisanje i upozorenje korisnika.

---

## 🔧 Instalacija i pokretanje
1. **Potrebni paketi:**
   - Node.js (v16+)
   - `npm install discord.js dotenv groq-sdk`

2. **Konfiguracija:**
   - Pronađi fajl **'cfg'**, otvori ga u Text dokumentu.
   - Podesi svoj token, API ključeve (TOKEN, GROQ_API_KEY), ID-ove kanala i rolova.
   - **JAKO VAŽAN DEO:** Promijeni naziv fajla iz `cfg` u `.env`.

3. **Pokretanje:**
   - `node index.js`

---

## 🛠️ Ostale Funkcionalnosti

### 🎚️ Leveling Sistem
- Dodjeljuje XP za aktivnost i šalje Level-up poruke.
- Komande: `!stats`, `!top`, `!resetlevel`.

### 🛡️ Link Zaštita
- Blokira sve linkove osim dozvoljenih (npr. youtube.com, discord.gg).
- Štiti server čak i ako korisnik naknadno **uredi (edit)** poruku da ubaci link.

### 👋 Dobrodošlice i Statistika
- Automatska dodjela role novim članovima.
- Personalizovana welcome poruka sa slikom.
- **Live Count:** Ažurira broj članova u nazivu glasovnog kanala svakih 30 minuta.

### 🔊 Glasovni Kanali
- Automatsko kreiranje privremenih kanala koji se brišu nakon 30 sekundi neaktivnosti.

## ⚠️ AI + HOST
- Sve je rađeno uz pomoć AI tehnologije.
- **Preporučeni Free Hosting:** Replit, OptikLink, KataBump...

---
⭐ **Ako koristiš ovaj kod, ostavi zvjezdicu na [GitHubu](https://github.com/Saiyan699/MyWorld)!**