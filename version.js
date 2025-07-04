const fetch = require('node-fetch');

module.exports = {
  current: '1.0.0',
  githubRepo: 'Saiyan699/MyWorld',

  async checkUpdates() {
    try {
      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/releases/latest`);
      if (!response.ok) return { error: 'GitHub API error' };
      
      const data = await response.json();
      return {
        current: this.current,
        latest: data.tag_name?.replace(/^v/, '') || 'N/A',
        url: data.html_url || `https://github.com/${this.githubRepo}/releases`
      };
    } catch (error) {
      return { error: error.message };
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
}