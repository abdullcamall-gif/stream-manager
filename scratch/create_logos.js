import fs from 'fs';
import path from 'path';

const servicesDir = path.join(process.cwd(), 'public', 'services');

if (!fs.existsSync(servicesDir)) {
  fs.mkdirSync(servicesDir, { recursive: true });
}

const logos = {
  'prime-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#00A8E1" d="M12.43 14.22c-1.38.16-2.61.24-3.69.24-2.88 0-4.08-1.15-4.08-3.41 0-2.39 1.54-3.9 4.38-3.9 1.15 0 2.22.19 3.2.56V4.18c-.89-.25-1.97-.37-3.15-.37-4.66 0-7.39 2.53-7.39 6.8 0 4.34 2.53 6.64 7.21 6.64 1.25 0 2.52-.15 3.52-.45v-2.58zm8.6-4.9c-1.06-.52-2.32-.78-3.7-.78-1.15 0-2.17.18-3.07.54v2.73c.8-.31 1.69-.47 2.65-.47.96 0 1.63.18 2.01.53.38.35.57.85.57 1.51 0 .61-.17 1.09-.52 1.45-.35.36-.93.54-1.74.54-.72 0-1.42-.14-2.1-.42v2.74c.78.36 1.76.54 2.94.54 1.48 0 2.66-.36 3.53-1.08.87-.72 1.3-1.76 1.3-3.12 0-1.57-.49-2.81-1.47-3.71-.35-.33-.8-.58-1.34-.76z"/></svg>`,
  'apple-music-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm5.508 14.156c-1.438.821-3.32.227-4.141-1.211-.82-.132-1.367-.34-1.367-1.367V6.844c0-.68.34-.85.85-.85.453 0 1.19.113 1.19.68v5.1h1.19c.85 0 1.367.34 1.367 1.19v.34c0 .85-.255 1.19-1.089 1.19z"/></svg>`,
  'hbo-max-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-2 15h-2V9h2v2h2V9h2v6h-2v-2h-2v2z"/></svg>`,
  'crunchyroll-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#F47521" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/></svg>`,
  'iptv-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#51f3e3" d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/></svg>`,
  'disneyplus-logo.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="#fff" d="M12 0C5.383 0 0 5.383 0 12s5.383 12 12 12 12-5.383 12-12S18.617 0 12 0zm-1 15h-2V9h4v2h-2v4z"/></svg>`
};

for (const [name, content] of Object.entries(logos)) {
  fs.writeFileSync(path.join(servicesDir, name), content);
  console.log(`Created ${name}`);
}
