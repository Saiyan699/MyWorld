# KodSaketa Discord Bot

## 📌 Osnovne informacije
- Platforma: Discord.js (Node.js)
- Namjena: Upravljanje serverom sa naprednim funkcionalnostima
- Glavne karakteristike: Leveling sistem, zaštita od spam linkova, automatski odgovori, dobrodošlice, upravljanje glasovnim kanalima, spam detekcija

## 🔧 Instalacija i pokretanje
1. Potrebni paketi:
   - Node.js (v16+)
   - npm install discord.js dotenv

2. Konfiguracija:
   - Kreirajte .env fajl sa sledećim varijablama:
     ```
     TOKEN='your-bot-token'
     CHANNEL_ID='your-channel-id'  # ID glavnog kanala
     WELCOME_CHANNEL_ID='welcome-channel-id'
     LOG_CHANNEL_ID='log-channel-id'
     VOICE_CATEGORY_ID='voice-category-id'
     IGNORE_CHANNEL_ID='ignore-channel-id'  # Kanali gdje responder ne radi
     SPAM_LIMIT=3  # Broj poruka za spam detekciju
     SPAM_INTERVAL=5000  # Vremenski interval u ms (npr. 5000 = 5 sekundi)
     ```

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

### 🚨 Spam Zaštita
- Automatska detekcija spam poruka
- Brisanje poruka i upozorenje korisnika ako pošalje više od 3 poruke u kratkom vremenskom periodu (5 sekundi)
- Role koje zaobilaze zaštitu: 👑 | �ᴏᴡɴᴇʀ, Moderator

### 🤖 Automatski Odgovori
- Ne radi u kanalima navedenim u IGNORE_CHANNEL_ID
- Odgovara na ključne reči:
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
- Mozete koristit Free Hostigne Replit, OptikLink, KataBump...
