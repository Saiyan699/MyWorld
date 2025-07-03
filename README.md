# Discord Bot - KodSaketa

## 📝 Opis Bota

Ovaj Discord bot je svestrani alat za upravljanje serverom sa funkcijama kao što su leveling sistem, automatski odgovori, zaštita od linkova, dobrodošlice za nove članove, upravljanje glasovnim kanalima i još mnogo toga. Bot je napisan u Node.js koristeći `discord.js` biblioteku.

## 🌟 Glavne Funkcije

### 1. **Leveling Sistem**
   - Korisnici dobijaju XP za svaku poslanu poruku
   - Level-up notifikacije sa posebnim porukama za određene nivoe
   - Komande `!stats` i `!top` za praćenje napretka
   - Admin komanda `!resetlevel` za resetovanje levela korisnika

### 2. **Autoresponder**
   - Automatski odgovori na ključne reči (npr. "hello", "help", "invite")
   - Podrška za delimično podudaranje (npr. "hvala" će odgovoriti na "thx", "thanks")
   - Nasumični odgovori za određene upite
   - Cooldown sistem da spriječi spam

### 3. **Link Protekcija**
   - Blokira sve linkove osim onih sa dozvoljenih domena
   - Posebne role koje mogu zaobići zaštitu
   - Detekcija linkova dodanih kroz uređivanje poruka
   - Logovanje obrisanih poruka sa linkovima

### 4. **Dobrodošlica za Nove Članove**
   - Automatsko dodjeljivanje role novim članovima
   - Personalizovana welcome poruka sa brojem člana
   - Uputstvo ka pravilima servera

### 5. **Privremeni Glasovni Kanali**
   - Automatsko kreiranje privremenih glasovnih kanala
   - Brisanje praznih kanala nakon 30 sekundi
   - Custom imena kanala bazirana na korisniku
   - Prava upravljanja za kreatora kanala

### 6. **Dodatne Funkcije**
   - Automatsko ažuriranje broja članova u imenu glasovnog kanala
   - Periodični podsjetnici za renew servera (svaka 3 dana)
   - Logovanje svih važnih akcija u poseban kanal

## ⚙️ Konfiguracija

Bot koristi `.env` fajl za sigurnosno čuvanje tokena. 
Glavne postavke se nalaze u `index.js` u kodu:
```
.env
TOKEN=tvoj token

index.js
const config = {
  logChannelId: 'ID kanala za logove',
  renewChannelId: 'ID kanala za renew podsjetnike',
  voiceChannelId: 'ID glasovnog kanala za brojanje članova',
  leveling: { ... },
  autoresponder: { ... },
  welcome: {
    channelId: 'ID welcome kanala',
    rulesChannelId: 'ID kanala sa pravilima',
    autoRoleId: 'ID role za nove članove'
  },
  voice: {
    createChannelName: 'Hub - Udji ovde',
    deleteAfter: 30000
  },
  allowedDomains: ['youtube.com', 'discord.gg', 'trusted-domain.com'],
  bypassRoles: ['👑 | ᴏᴡɴᴇʀ', 'LinkProtection', 'Sake']
};
