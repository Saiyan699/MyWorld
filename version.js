require('dotenv').config();
const fetch = require('node-fetch');
const { ActivityType } = require('discord.js');

module.exports = {
    current: '1.0.0', // Postavite trenutnu verziju bota
    githubRepo: 'Saiyan699/MyWorld', // Zamijenite sa svojim repozitorijumom
    lastCheckedVersion: null,

    async checkUpdates(client) {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/releases/latest`, {
                headers: {
                    'Authorization': process.env.GITHUB_TOKEN ? `token ${process.env.GITHUB_TOKEN}` : ''
                }
            });

            // Obrada odgovora
            if (response.status === 404) {
                //IZBJEGAVANJE SPAMA - AKO NEKIM SLUCAJEM IZBRISEM VERZIJU S GITHUBA (SAMO HOST CONSOLE LOG)
                //console.log('ℹ️ Repozitorij nije pronađen ili nema release-a');
                return null;
            }

            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.status}`);
            }

            const data = await response.json();
            if (!data.tag_name) {
                console.log('ℹ️ Nema dostupnih release-a');
                return null;
            }

            const latestVersion = data.tag_name.replace(/^v/, '');
            const isNewUpdate = latestVersion !== this.current && this.lastCheckedVersion !== latestVersion;

            if (isNewUpdate) {
                this.lastCheckedVersion = latestVersion;
                await this.notifyUpdate(client, {
                    latest: latestVersion,
                    url: data.html_url,
                    notes: data.body || 'Nema release notes'
                });
            }

            return {
                current: this.current,
                latest: latestVersion,
                url: data.html_url,
                isNew: isNewUpdate
            };

        } catch (error) {
			//IZBJEGAVANJE SPAMA - UKOLIKO IZBACIM NOVU VERZIJU A VAZ BOJ JE ONLINE (SAMO HOST CONSOLE LOG)
            //console.error('⚠️ Greška dostupna su ažuriranja:', error.message);
            return null;
        }
    },

    async notifyUpdate(client, { latest, url, notes }) {
        if (!process.env.UPDATE_CHANNEL_ID) return;

        try {
            const channel = client.channels.cache.get(process.env.UPDATE_CHANNEL_ID);
            if (!channel) {
                console.warn('⚠️ Update kanal nije pronađen');
                return;
            }

            await channel.send({
                embeds: [{
                    title: `🎉 Nova verzija v${latest} dostupna!`,
                    description: notes.substring(0, 2000), // Limit za embed
                    color: 0x00FF00,
                    fields: [
                        { name: 'Trenutna verzija', value: this.current, inline: true },
                        { name: 'Nova verzija', value: latest, inline: true },
                        { name: 'Preuzmite', value: `[Klikni ovdje](${url})` }
                    ],
                    timestamp: new Date().toISOString()
                }]
            });
        } catch (error) {
            console.error('⚠️ Greška pri slanju obavijesti:', error);
        }
    },

    printASCII() {
         console.log(`
  ███╗   ███╗██╗   ██╗ ██╗    ██╗ ██████╗ ██████╗ ██╗     ██████╗ 
  ████╗ ████║╚██╗ ██╔╝ ██║    ██║██╔═══██╗██╔══██╗██║     ██╔══██╗
  ██╔████╔██║ ╚████╔╝  ██║ █╗ ██║██║   ██║██████╔╝██║     ██║  ██║
  ██║╚██╔╝██║  ╚██╔╝   ██║███╗██║██║   ██║██╔══██╗██║     ██║  ██║
  ██║ ╚═╝ ██║   ██║    ╚███╔███╔╝╚██████╔╝██║  ██║███████╗██████╔╝
  ╚═╝     ╚═╝   ╚═╝     ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═════╝ 
  v${this.current}
        `);
    },

    async init(client) {
        this.printASCII();
        try {
            const update = await this.checkUpdates(client);
            if (update?.isNew) {
                console.log('\x1b[33m%s\x1b[0m', `⚠️ Nova verzija dostupna: v${update.latest}`);
            }
        } catch (error) {
            console.error('⚠️ Greška pri inicijalnoj provjeri:', error);
        }
    }
};
