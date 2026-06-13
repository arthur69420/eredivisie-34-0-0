/* Zet een van Transfermarkt geplakte selectie (Nederlandstalige kaderpagina)
   om naar databaseregels en mergt die in js/data.js voor een seizoen+club.
   Bestaande, handmatig gezette spelers en ratings blijven ongemoeid; alleen
   ontbrekende spelers worden toegevoegd. Ratings volgen uit de marktwaarde.

   Gebruik:
     node tools/parse-tm-paste.js "2010/11" "Ajax" tools/paste/tmp.txt
     node tools/parse-tm-paste.js "2010/11" "Ajax" tools/paste/tmp.txt --dry
*/
"use strict";
const fs = require("fs");
const path = require("path");

const [,, seasonKey, clubName, pasteFile] = process.argv;
const DRY = process.argv.includes("--dry");
if(!seasonKey || !clubName || !pasteFile){
  console.error('gebruik: node tools/parse-tm-paste.js "2010/11" "Ajax" <pastebestand> [--dry]');
  process.exit(1);
}
const ROOT = path.join(__dirname, "..");

/* ---- positie NL -> onze code ---- */
const POS = {
  "Keeper":"GK",
  "Libero":"CB","Centrale verdediger":"CB",
  "Linksback":"LB","Linkervleugelverdediger":"LB",
  "Rechtsback":"RB","Rechtervleugelverdediger":"RB",
  "Defensief middenveld":"DM","Verdedigend middenveld":"DM",
  "Centraal middenveld":"CM","Middenvelder":"CM",
  "Rechter middenveld":"RW","Linker middenveld":"LW",
  "Aanvallend middenveld":"AM",
  "Linksbuiten":"LW","Rechtsbuiten":"RW",
  "Hangende spits":"ST","Schaduwspits":"ST","Centrumspits":"ST","Aanvaller":"ST"
};

/* ---- rating uit marktwaarde, zelfde schaal als build-db.js (65-99) ---- */
function scaleRating(r){
  const n = Math.max(0, Math.min(1, (r - 60) / 28));
  return Math.round(65 + Math.pow(n, 1.5) * 34);
}
function rawRating(mv){
  if(!mv || mv < 50000) return 64;
  return Math.max(60, Math.min(88, Math.round(62 + 6 * Math.log10(mv / 250000))));
}
const rating = mv => scaleRating(rawRating(mv));

/* ---- marktwaarde-string -> euro ---- */
function parseMV(s){
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(mln|dzd)\.?\s*€/);
  if(!m) return 0;
  const num = parseFloat(m[1].replace(",", "."));
  return Math.round(num * (m[2] === "mln" ? 1e6 : 1e3));
}

const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, " ").trim();

/* ---- paste parsen: positieregel is het anker ---- */
const lines = fs.readFileSync(path.join(ROOT, pasteFile), "utf8")
  .split("\n").map(l => l.replace(/\r/g, "").trim()).filter(l => l.length);
const parsed = [];
for(let i = 0; i < lines.length; i++){
  const pos = POS[lines[i]];
  if(!pos) continue;
  const name = (lines[i-1] || "").split("\t")[0].trim();
  if(!name) continue;
  let mv = 0;
  for(let k = 1; k <= 2 && i + k < lines.length; k++){
    mv = parseMV(lines[i + k]);
    if(mv) break;
  }
  parsed.push({ name, pos, mv });
}

/* ---- in data.js mergen ---- */
const dataSrc = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8");
const SEASONS = new Function(dataSrc + "; return SEASONS;")();
if(!SEASONS[seasonKey]){ console.error("onbekend seizoen: " + seasonKey); process.exit(1); }
const club = SEASONS[seasonKey].find(c => c.n === clubName);
if(!club){ console.error("club niet gevonden in " + seasonKey + ": " + clubName); process.exit(1); }

const have = new Set(club.p.filter(pl => String(pl[0]).indexOf("Jeugdspeler") !== 0).map(pl => norm(pl[0])));
let added = 0;
parsed.forEach(p => {
  if(have.has(norm(p.name))) return;
  have.add(norm(p.name));
  club.p.push([p.name, p.pos, rating(p.mv)]);
  added++;
});

/* ---- serialiseren (zelfde formaat als build-db.js) ---- */
function esc(s){ return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
const serClub = c => '{n:"' + esc(c.n) + '",a:"' + esc(c.a) + '",p:[' +
  c.p.map(pl => '["' + esc(pl[0]) + '","' + pl[1] + '",' + pl[2] + ']').join(",") + ']}';
const serSeason = sk => '"' + sk + '":[\n' + SEASONS[sk].map(serClub).join(",\n") + '\n]';
const out = "/* Gecureerde kernselecties per Eredivisie-seizoen (2010/11 - 2025/26).\n"
  + "   Formaat: {n: clubnaam, a: afkorting, p: [[naam, positie, rating], ...]}\n"
  + "   Posities: GK RB CB LB DM CM AM LW RW ST\n"
  + "   Selecties 2012/13-2025/26 aangevuld uit transfermarkt-datasets (tools/build-db.js);\n"
  + "   2010/11-2011/12 aangevuld uit geplakte Transfermarkt-kaders (tools/parse-tm-paste.js);\n"
  + "   ratings (65-99) afgeleid uit marktwaarde. Ontbrekende posities worden in app.js\n"
  + "   automatisch aangevuld met jeugdspelers. */\n"
  + "const SEASONS = {\n\n"
  + Object.keys(SEASONS).map(serSeason).join(",\n\n")
  + "\n};\n";

console.error("geparsed: " + parsed.length + " spelers · nieuw toegevoegd aan " + clubName + " " + seasonKey + ": " + added);
if(DRY) console.error("(dry run - niets geschreven)");
else { fs.writeFileSync(path.join(ROOT, "js", "data.js"), out); console.error("js/data.js geschreven."); }
