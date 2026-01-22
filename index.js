require('dotenv').config();

const { Client, GatewayIntentBits, Partials, EmbedBuilder, ActivityType } = require('discord.js');
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const spamTracker = new Map();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel]
});


// Konfiguracija //sve prebaceno u .env
const config = {
  logChannelId: process.env.LOG_CHANNEL_ID,
  voiceChannelId: process.env.VOICE_CHANNEL_ID,
  leveling: {
    xpPerMessage: { 
      min: parseInt(process.env.XP_PER_MESSAGE_MIN), 
      max: parseInt(process.env.XP_PER_MESSAGE_MAX) 
    },
    xpNeededMultiplier: parseInt(process.env.XP_NEEDED_MULTIPLIER),
    cooldown: parseInt(process.env.LEVELING_COOLDOWN),
    levelUpMessages: {
      5: "🎉 Bravo! Dostigli ste level 5!",
      10: "🔥 Wow, već level 10!",
      20: "🌟 Legendarni level 20!",
      30: "💎 Master level 30!"
    }
  },
  autoresponder: {
    cooldown: parseInt(process.env.AUTORESPONDER_COOLDOWN),
    ignoredChannels: (process.env.AUTORESPONDER_IGNORED_CHANNELS || "").split(',')
  },
  welcome: {
    channelId: process.env.WELCOME_CHANNEL_ID,
    rulesChannelId: process.env.RULES_CHANNEL_ID,
    autoRoleId: process.env.AUTO_ROLE_ID 
  },
  voice: {
    createChannelName: process.env.CREATE_CHANNEL_NAME,
    deleteAfter: parseInt(process.env.DELETE_AFTER)
  },
  allowedDomains: process.env.ALLOWED_DOMAINS.split(','),
  bypassRoles: process.env.BYPASS_ROLES.split(',')
};

// Baza podataka
const leveling = {};
const cooldowns = {
  xp: {},
  responses: {}
};


client.on('messageCreate', async (message) => {
  // Ignoriši botove i poruke bez teksta
  if (message.author.bot || !message.content) return;

  // Provjera da li je bot tagovan
  if (message.mentions.has(client.user) && !message.mentions.everyone) {
    
    // Čistimo poruku od taga bota da AI dobije samo pitanje
    const prompt = message.content.replace(/<@!?\d+>/g, '').trim();

    if (!prompt) return message.reply("Reci, kako ti mogu pomoći? 🤖");

    try {
      // Pokaži da bot "kuca"
      await message.channel.sendTyping();

      const chatCompletion = await groq.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "Ti si koristan Discord asistent koji priča na našem jeziku." 
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        model: "llama-3.3-70b-versatile", // Ovo je trenutno njihov najbolji model
      });

      const response = chatCompletion.choices[0]?.message?.content;
      
      if (!response) {
        return message.reply("Nažalost, trenutno ne mogu da generišem odgovor.");
      }

      // Discord limit od 2000 karaktera
      if (response.length > 2000) {
        return message.reply(response.substring(0, 1900) + "...");
      }

      await message.reply(response);

    } catch (error) {
      console.error("Groq AI Greška:", error);
      message.reply("Ups! Došlo je do greške u komunikaciji sa mojim mozgom. 🧠❌");
    }
  }
});


client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Provjeri da li korisnik ima rolu koja zaobilazi spam filter
  const hasBypassRole = message.member?.roles.cache.some(role => 
    config.bypassRoles.includes(role.name)
  );
  if (hasBypassRole) return;

  const userId = message.author.id;
  const currentMessage = message.content.trim();
  
  // Dohvaćamo ID prve slike ako postoji (ID je bolji od URL-a jer je trajan)
  const currentAttachmentId = message.attachments.first() ? message.attachments.first().id : null;

  // Ako poruka nema ni teksta ni slike, ignoriraj (npr. sistemske poruke)
  if (!currentMessage && !currentAttachmentId) return;

  if (!spamTracker.has(userId)) {
    spamTracker.set(userId, { 
      lastMessage: currentMessage, 
      lastAttachment: currentAttachmentId, 
      count: 1 
    });
    return;
  }

  const userData = spamTracker.get(userId);

  // LOGIKA PROVJERE: Da li je tekst isti ILI je slika ista kao prethodna?
  const isTextSpam = (currentMessage !== "" && currentMessage === userData.lastMessage);
  const isImageSpam = (currentAttachmentId !== null && currentAttachmentId === userData.lastAttachment);

  if (isTextSpam || isImageSpam) {
    userData.count++;
    // Ažuriramo podatke u mapi
    spamTracker.set(userId, userData);
  } else {
    // Ako je poslao nešto novo, resetujemo brojač na taj novi sadržaj
    spamTracker.set(userId, { 
      lastMessage: currentMessage, 
      lastAttachment: currentAttachmentId, 
      count: 1 
    });
    return;
  }

  // KAZNA
  if (userData.count >= 3) {
    try {
      await message.delete();
      const warning = await message.channel.send(
        `${message.author}, **zabranjeno je spamovanje (tekst ili slike)!** 🚨`
      );
      setTimeout(() => warning.delete().catch(() => {}), 5000);
      
      // Reset tracker nakon kazne
      spamTracker.delete(userId);

      // Loguj u kanal
      await sendToLog(message.guild, 'SPAM DETEKCIJA', message.author, {
        "Tip spama": isImageSpam ? "Slika/Fajl" : "Tekst",
        "Sadržaj": currentMessage || "Priložena slika",
        "Ponavljanja": userData.count,
        "Kanal": message.channel.name
      });
    } catch (error) {
      console.error("Greška pri kažnjavanju spama:", error);
    }
  }
});

// Dodajte novi event handler za uređivanje poruka
client.on('messageUpdate', async (oldMessage, newMessage) => {
  if (newMessage.author.bot) return;

  // Provjeri ima li korisnik role koje zaobilaze provjeru
  const hasBypassRole = newMessage.member?.roles.cache.some(role => 
    config.bypassRoles.includes(role.name)
  );

  if (hasBypassRole) return; // Preskoči ako ima role

  // Ostatak provjere linkova (isti kao prije)...
  const oldLinks = oldMessage.content.match(/(https?:\/\/|www\.)[^\s]+/gi) || [];
  const newLinks = newMessage.content.match(/(https?:\/\/|www\.)[^\s]+/gi) || [];

  if (oldLinks.length === 0 && newLinks.length > 0) {
    const hasForbiddenLink = newLinks.some(link => 
      !config.allowedDomains.some(domain => link.includes(domain))
    );

    if (hasForbiddenLink) {
      await newMessage.delete().catch(console.error);
      const warning = await newMessage.channel.send(
        `${newMessage.author}, uređivanje poruka kako bi se dodali linkovi nije dozvoljeno!\n` +
        `${newMessage.author}, u opasnosti si bjezi 🚨`
      );
      setTimeout(() => warning.delete().catch(console.error), 5000);
      await sendToLog(newMessage.guild, 'LINK DODAN EDITOM', newMessage.author, {
        "Originalna poruka": oldMessage.content,
        "Nova poruka": newMessage.content,
        "Kanal": newMessage.channel.name
      });
    }
  }
});
//Broj Clanova u Discord Kanalu
async function updateVoiceChannelMemberCount() {
  const guilds = client.guilds.cache;
  guilds.forEach(async (guild) => {
    const channel = guild.channels.cache.get(config.voiceChannelId);
    if (channel) {
      try {
        await channel.setName(`🟢 LIVE: ${guild.memberCount}`);
        console.log(`Ažuriran naziv kanala: ${channel.name}`);
      } catch (err) {
        console.error('Greška pri promjeni naziva kanala:', err);
      }
    }
  });
}

// Funkcija za logovanje
async function sendToLog(guild, action, user, details = {}) {
  const logChannel = guild.channels.cache.get(config.logChannelId);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🚨 ${action}`)
    .setColor('#FF0000')
    .setDescription(`Korisnik: ${user.tag} (${user.id})`)
    .setTimestamp();

  if (Object.keys(details).length > 0) {
    embed.addFields(
      Object.entries(details).map(([name, value]) => ({ 
        name, 
        value: String(value).slice(0, 1024), // Limit za embed field
        inline: true 
      }))
    );
  }

  await logChannel.send({ embeds: [embed] }).catch(console.error);
}

// 2. LINK PROTEKCIJA
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Provjeri ima li korisnik role koje zaobilaze provjeru
  const hasBypassRole = message.member?.roles.cache.some(role => 
    config.bypassRoles.includes(role.name)
  );

  if (hasBypassRole) return; // Preskoči ako ima role

  // Ostatak link protekcije (isti kao prije)...
  const linkRegex = /(https?:\/\/|www\.)[^\s]+/gi;
  const containsLink = linkRegex.test(message.content);

  if (containsLink) {
    const isAllowed = config.allowedDomains.some(domain => 
      message.content.toLowerCase().includes(domain.toLowerCase())
    );

    if (!isAllowed) {
      await message.delete().catch(console.error);
      const warning = await message.channel.send(
        `${message.author}, slanje linkova nije dozvoljeno!\n` +
        `${message.author}, u opasnosti si bjezi 🚨`
      );
      setTimeout(() => warning.delete().catch(console.error), 5000);
      await sendToLog(message.guild, 'LINK OBRISAN', message.author, {
        "Poruka": message.content,
        "Kanal": message.channel.name
      });
    }
  }
});

// 3. WELCOME MODUL
client.on('guildMemberAdd', async member => {
  // Dodijeli rolu
  try {
    const role = member.guild.roles.cache.get(config.welcome.autoRoleId);
    if (role) {
      await member.roles.add(role);
      console.log(`Dodijeljena rola ${role.name} korisniku ${member.user.tag}`);
    } else {
      console.error(`Rola s ID ${config.welcome.autoRoleId} nije pronađena!`);
    }
  } catch (error) {
    console.error(`Greška pri dodjeljivanju role:`, error);
  }

  // Pošalji welcome poruku (postojeći kod)
  const channel = member.guild.channels.cache.get(config.welcome.channelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('KodSaketa')
    .setDescription(`${member} se pridružio/la **KodSaketa**, dobrodošlo/la!\n\n` +
      `🙋‍♂️ Ti si **${member.guild.memberCount}.** član discorda.\n\n` +
      `📕 Pročitajte pravila servera <#${config.welcome.rulesChannelId}>\n`)
    .setImage('https://cdn.discordapp.com/attachments/1389923297377914910/1389923383285907507/standard.gif?ex=68666286&is=68651106&hm=eb45021a6e3ac462837a9c028c51c5b1c1a7309e17d9ad13f35ac00f12f971d4&')
    .setFooter({ text: 'kick.com/livesake, @SAKE' })
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

// 3. AUTORESPONDER MODUL
const autoresponses = {
  "livesake": "📺 Kick: https://kick.com/livesake",
  "ping": "pong! 🏓",
  "hello": "Hello there! 👋",
  "bok": "Bok! Kako mogu pomoći? 😊",
  "hvala": "Nema na čemu! 🫶",
  "zdravo": "Zdravo! Šta ima? 🤗",
  "kako si": "Ja sam super, hvala na pitanju! A ti? 😄",
  "laku noc": "Laku noć! 😴 Spavaj slatko!",
  "jutro": "Dobro jutro! ☀️ Kako si danas?",
  "pravila": `📜 Pravila servera nalaze se u <#${config.welcome.rulesChannelId}>`,
  "invite": "🔗 Invite link za server: https://discord.gg/AnBRAHrqJc",
  "sake": "🧚‍♂️ Otkud sake na nebesima! 😄",
  "bot": "🤖 Ja sam Discord bot napravljen pomoću discord.js!",
  "github": "🚀 Moj kod i najnovije verzije možeš preuzeti ovde: https://github.com/Saiyan699/MyWorld/releases",
  "help": [
    "Trebate li pomoć? 🤔",
    "Kako vam mogu pomoći danas? 😊",
    "Imate li nekih pitanja? Pitajte slobodno!"
  ],
  "komande": "ℹ️ Dostupne komande: !stats, !top, !invite, !pravila, !help"
};

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (config.autoresponder.ignoredChannels.includes(message.channel.id)) {
    return; 
  }
  const content = message.content.toLowerCase().trim();
  // Autoresponder
  if (!cooldowns.responses[message.author.id] || Date.now() > cooldowns.responses[message.author.id]) {
    if (autoresponses[content]) {
      const response = autoresponses[content];
      const reply = Array.isArray(response) ? 
        response[Math.floor(Math.random() * response.length)] : 
        response;

      await message.reply(reply);
      cooldowns.responses[message.author.id] = Date.now() + (config.autoresponder.cooldown * 1000);
      return;
    }

    const partialMatches = {
      "hvala": ["thx", "thanks", "tnx", "hvala ti"],
      "help": ["pomoć", "pomoc", "help", "pomoz", "upit"],
      "invite": ["link", "invite", "dodaj me", "poziv"],
      "livesake": ["youtube", "yt", "kanal", "live sake", "kick"]
    };

    for (const [key, triggers] of Object.entries(partialMatches)) {
      if (triggers.some(trigger => content.includes(trigger)) && autoresponses[key]) {
        const response = autoresponses[key];
        await message.reply(Array.isArray(response) ? 
          response[Math.floor(Math.random() * response.length)] : 
          response);

        cooldowns.responses[message.author.id] = Date.now() + (config.autoresponder.cooldown * 1000);
        return;
      }
    }
    }


  // 4. KOMANDE SA LOGOVIMA
  if (content === '!stats') {
    const userId = message.author.id;
    if (!leveling[userId]) {
      await message.reply("Još niste zaradili XP!");
      return;
    }

    const nextLevelXP = leveling[userId].level * config.leveling.xpNeededMultiplier;
    const progress = Math.min(100, Math.floor((leveling[userId].xp / nextLevelXP) * 100));

    await message.reply(
      `📊 Tvoja statistika:\n` +
      `🔹 Level: ${leveling[userId].level}\n` +
      `🔹 XP: ${leveling[userId].xp}/${nextLevelXP} (${progress}%)\n` +
      `🔹 Ukupno XP: ${leveling[userId].xp + (leveling[userId].level - 1) * config.leveling.xpNeededMultiplier}`
    );

    await sendToLog(message.guild, '!stats', message.author, {
      Level: leveling[userId].level,
      XP: `${leveling[userId].xp}/${nextLevelXP}`,
      Progress: `${progress}%`
    });
    return;
  }

  if (content === '!top') {
    const sorted = Object.entries(leveling)
      .sort((a, b) => (b[1].level * 1000 + b[1].xp) - (a[1].level * 1000 + a[1].xp))
      .slice(0, 5);

    if (sorted.length === 0) {
      await message.reply("Još nitko nije zaradio XP!");
      return;
    }

    let topList = "🏆 Top 5 korisnika po levelima:\n";
    for (const [i, [userId, data]] of sorted.entries()) {
      const user = await client.users.fetch(userId).catch(() => null);
      if (user) topList += `${i+1}. ${user.username} - Level ${data.level} (${data.xp} XP)\n`;
    }

    await message.channel.send(topList);
    await sendToLog(message.guild, '!top', message.author);
    return;
  }

  if (content.startsWith('!resetlevel') && message.member.permissions.has('ADMINISTRATOR')) {
    const mentioned = message.mentions.users.first();
    if (!mentioned) {
      await message.reply("Morate tagirati korisnika!");
      return;
    }

    leveling[mentioned.id] = { xp: 0, level: 1 };
    await message.channel.send(`Level korisnika ${mentioned.tag} je resetovan!`);

    await sendToLog(message.guild, '!resetlevel', message.author, {
      "Resetovano za": mentioned.tag,
      "Novi level": 1
    });
    return;
  }
});

// 5. LEVELING SISTEM
client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (cooldowns.xp[message.author.id] && Date.now() < cooldowns.xp[message.author.id]) return;

  const userId = message.author.id;
  if (!leveling[userId]) leveling[userId] = { xp: 0, level: 1 };

  const xpGain = Math.floor(Math.random() * (config.leveling.xpPerMessage.max - config.leveling.xpPerMessage.min + 1)) + config.leveling.xpPerMessage.min;
  leveling[userId].xp += xpGain;

  const xpNeeded = leveling[userId].level * config.leveling.xpNeededMultiplier;
  if (leveling[userId].xp >= xpNeeded) {
    leveling[userId].level++;
    leveling[userId].xp = 0;
    const levelUpMessage = config.leveling.levelUpMessages[leveling[userId].level] || `${message.author} je sada level ${leveling[userId].level}! 🎉`;
    await message.channel.send(levelUpMessage);

    await sendToLog(message.guild, 'LEVEL UP', message.author, {
      "Novi level": leveling[userId].level,
      "XP Gain": xpGain
    });
  }

  cooldowns.xp[message.author.id] = Date.now() + (config.leveling.cooldown * 1000);
});

// 6. TEMPORARY VOICE MODUL
client.on('voiceStateUpdate', async (oldState, newState) => {
  const channel = newState.channel;
  const guild = newState.guild;

  if (channel && channel.name === config.voice.createChannelName) {
    try {
      const tempChannel = await guild.channels.create({
        name: `Voice: ${newState.member.displayName}`,
        type: 2,
        parent: channel.parent,
        permissionOverwrites: [
    //      { id: newState.member.id, allow: ['Connect', 'ManageChannels'] },
    //      { id: guild.roles.everyone.id, deny: ['Connect'] }
        ],
      });

      await newState.setChannel(tempChannel);

      await sendToLog(guild, 'VOICE KREIRAN', newState.member.user, {
        "Kanal": tempChannel.name,
        "Kategorija": channel.parent?.name || 'Nema'
      });

      setTimeout(() => {
        if (tempChannel.members.size === 0) {
          tempChannel.delete().catch(console.error);
          sendToLog(guild, 'VOICE OBRISAN', newState.member.user, {
            "Kanal": tempChannel.name,
            "Razlog": "Prazan kanal"
          });
        }
      }, config.voice.deleteAfter);

    } catch (error) {
      console.error("Greška pri kreiranju temp kanala:", error);
      sendToLog(guild, 'VOICE GREŠKA', newState.member.user, {
        "Greška": error.message
      });
    }
  }
});


client.on('guildMemberAdd', () => {
  updateVoiceChannelMemberCount();
});

client.on('guildMemberRemove', () => {
  updateVoiceChannelMemberCount();
});

client.login(process.env.TOKEN);
