// The one Chrome for Testing build SpotPlot uses for PDFs: bundled into the app by forge.config.js
// and used by `npm start` in dev. Change it here only; download a new build with
// `npx @puppeteer/browsers install chrome@<version>` before building.
module.exports = { CHROME_BUILD: '151.0.7922.77' };
