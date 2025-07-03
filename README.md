# KodSaketa Discord Bot

## 📌 Osnovne informacije
- Platforma: Discord.js (Node.js)
- Namjena: Upravljanje serverom sa naprednim funkcionalnostima
- Glavne karakteristike: Leveling sistem, zaštita od spam linkova, automatski odgovori, dobrodošlice, upravljanje glasovnim kanalima

## 🔧 Instalacija i pokretanje
1. Potrebni paketi:
   - Node.js (v16+)
   - npm install discord.js dotenv

2. Konfiguracija:
   - Kreirajte .env fajl sa TOKEN='your-bot-token'
   - Uredite config objekat u index.js sa pravim ID-ima kanala

3. Pokretanje:
   - node index.js

## ✨ Funkcionalnosti

### 🎚️ Leveling Sistem
- Dodeljuje XP za aktivnost
- Level-up notifikacije
- Komande:
  - !stats - Prikaz vašeg nivoa
  - !top - Top lista korisnika
  - !resetlevel [@user] (samo admin)

### 🛡️ Link Zaštita
- Blokira sve linkove osim dozvoljenih domena
- Dozvoljeni linkovi: youtube.com, discord.gg
- Role koje zaobilaze zaštitu: 👑 | �ᴏᴡɴᴇʀ, LinkProtection

### 🤖 Automatski Odgovori
Odgovara na ključne reči:
- livesake → YouTube link
- ping → pong
- hello, bok → Pozdravni odgovori
- pravila → Uputstvo ka pravilima
- help → Pomoć za komande

### 👋 Dobrodošlice
- Automatska dodela role novim članovima
- Personalizovana welcome poruka
- Brojanje članova

### 🔊 Glasovni Kanali
- Automatsko kreiranje privremenih kanala
- Brisanje nakon 30 sekundi neaktivnosti
- Prava upravljanja za kreatora

### 📊 Statistike
- Ažuriranje broja članova u nazivu kanala
- Logovanje svih važnih akcija

## ⚠️ AI + HOST Napomene
- Sve je radito uz pomoc AI
- Mozete koristit Free Hostigne Replit,OptikLink,KataBump...
