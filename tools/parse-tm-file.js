/* Verwerkt een compleet seizoensbestand met alle 18 clubs (van Transfermarkt
   geplakte Nederlandstalige kaders, clubs gescheiden door een regel "BREAK",
   clubnaam als eerste regel van elk blok) en bouwt per club een selectie met
   een cap.

   Werkwijze:
   - de doelseizoen-clubs worden eerst teruggezet naar de gecureerde basis uit
     commit BASE_REF (na de rating-herijking, voor eventuele plak-merges), zodat
     herhaald draaien idempotent is en niet stapelt;
   - bestaande gecureerde spelers + hun handmatige ratings blijven behouden;
   - daarna wordt aangevuld met de hoogst gewaardeerde spelers uit het bestand:
     eerst tot de verplichte posities gedekt zijn, dan tot CAP spelers totaal.
   - ratings van toegevoegde spelers volgen uit de marktwaarde van dat seizoen.

   Gebruik:
     node tools/parse-tm-file.js "2010/11" "C:/pad/eredivisie10-11.txt"
     node tools/parse-tm-file.js "2010/11" "C:/pad/eredivisie10-11.txt" --dry
*/
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const [,, seasonKey, file] = process.argv;
const DRY = process.argv.includes("--dry");
const CAP = 18;
const BASE_REF = "0f8f8b4"; // schone, herijkte basis vóór plak-merges
if(!seasonKey || !file){
  console.error('gebruik: node tools/parse-tm-file.js "2010/11" <bestand> [--dry]');
  process.exit(1);
}
const ROOT = path.join(__dirname, "..");

/* clubnaam in bestand -> onze DB-naam (alleen afwijkingen) */
const ALIAS = { "AZ Alkmaar":"AZ", "NEC Nijmegen":"NEC" };
const clubName = raw => ALIAS[raw] || raw;

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
const REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];

function scaleRating(r){ const n = Math.max(0, Math.min(1, (r - 60) / 28)); return Math.round(65 + Math.pow(n, 1.5) * 34); }
function rawRating(mv){ if(!mv || mv < 50000) return 64; return Math.max(60, Math.min(88, Math.round(62 + 6 * Math.log10(mv / 250000)))); }
const rating = mv => scaleRating(rawRating(mv));
function parseMV(s){
  const m = s.match(/(\d+(?:[.,]\d+)?)\s*(mln|dzd)\.?\s*€/);
  if(!m) return 0;
  return Math.round(parseFloat(m[1].replace(",", ".")) * (m[2] === "mln" ? 1e6 : 1e3));
}
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/* ---- bestand in clubblokken parsen ---- */
const raw = fs.readFileSync(file, "utf8").split("\n").map(l => l.replace(/\r/g, "").trim());
const blocks = [];
let cur = [];
raw.forEach(l => { if(l === "BREAK"){ blocks.push(cur); cur = []; } else cur.push(l); });
blocks.push(cur);

const fileClubs = {}; // onze clubnaam -> [{name,pos,mv}, ...]
blocks.forEach(block => {
  const lines = block.filter(l => l.length);
  if(!lines.length) return;
  const cname = clubName(lines[0]);
  const players = [];
  for(let i = 1; i < lines.length; i++){
    const pos = POS[lines[i]];
    if(!pos) continue;
    const name = (lines[i-1] || "").split("\t")[0].trim();
    if(!name) continue;
    let mv = 0;
    for(let k = 1; k <= 2 && i + k < lines.length; k++){ mv = parseMV(lines[i+k]); if(mv) break; }
    players.push({ name, pos, mv });
  }
  fileClubs[cname] = players;
});

/* ---- huidige data + schone basis voor het doelseizoen ---- */
const SEASONS = new Function(fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8") + "; return SEASONS;")();
const baseSrc = execSync("git show " + BASE_REF + ":js/data.js", { cwd: ROOT, encoding: "utf8" });
const BASE = new Function(baseSrc + "; return SEASONS;")();
if(!BASE[seasonKey]){ console.error("seizoen niet in basis: " + seasonKey); process.exit(1); }
SEASONS[seasonKey] = BASE[seasonKey].map(c => ({ n: c.n, a: c.a, p: c.p.map(pl => pl.slice()) }));

/* ---- per club cappen + aanvullen ---- */
let totAdd = 0;
const report = [];
SEASONS[seasonKey].forEach(club => {
  const fc = fileClubs[club.n];
  if(!fc){ report.push(club.n + ": GEEN bestand-data"); return; }
  const existing = club.p.filter(pl => String(pl[0]).indexOf("Jeugdspeler") !== 0);
  const baseN = existing.length;
  club.p = existing;
  const have = new Set(existing.map(pl => norm(pl[0])));
  const cnt = {};
  existing.forEach(pl => cnt[pl[1]] = (cnt[pl[1]] || 0) + 1);

  const cand = fc.filter(p => !have.has(norm(p.name))).sort((a, b) => b.mv - a.mv);
  const need = pos => (cnt[pos] || 0) < (REQ.find(r => r[0] === pos) || [0,0])[1];
  let added = 0;
  const addOne = p => { club.p.push([p.name, p.pos, rating(p.mv)]); have.add(norm(p.name)); cnt[p.pos] = (cnt[p.pos]||0)+1; added++; totAdd++; };
  // 1) verplichte posities
  cand.forEach(p => { if(club.p.length < CAP && need(p.pos) && !have.has(norm(p.name))) addOne(p); });
  // 2) hoogste marktwaarde tot CAP
  cand.forEach(p => { if(club.p.length < CAP && !have.has(norm(p.name))) addOne(p); });
  // 3) ontbrekende verplichte posities: een echte speler uit een verwante
  //    positie met overschot ompositioneren (geen jeugdspeler)
  const reqOf = p => (REQ.find(r => r[0] === p) || [0,0])[1];
  const DONOR = {
    RB:["LB","RW","CB","DM","CM"], LB:["RB","LW","CB","DM","CM"],
    CB:["DM","CM","LB","RB"], CM:["DM","AM","RW","LW"],
    LW:["RW","AM","ST","CM"], RW:["LW","AM","ST","CM"], ST:["AM","RW","LW","CM"]
  };
  let converted = 0;
  REQ.forEach(([pos, n]) => {
    while((cnt[pos] || 0) < n){
      let did = false;
      for(const dp of (DONOR[pos] || [])){
        if((cnt[dp] || 0) > reqOf(dp)){
          let idx = -1, lo = 999;
          club.p.forEach((pl, k) => { if(pl[1] === dp && pl[2] < lo){ lo = pl[2]; idx = k; } });
          if(idx >= 0){ club.p[idx][1] = pos; cnt[dp]--; cnt[pos] = (cnt[pos]||0)+1; converted++; did = true; break; }
        }
      }
      if(!did) break;
    }
  });
  report.push(club.n + ": " + baseN + " gecureerd + " + added + " toegevoegd" + (converted ? " + " + converted + " omgezet" : "") + " = " + club.p.length);
});

/* ---- serialiseren ---- */
function esc(s){ return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
const serClub = c => '{n:"' + esc(c.n) + '",a:"' + esc(c.a) + '",p:[' +
  c.p.map(pl => '["' + esc(pl[0]) + '","' + pl[1] + '",' + pl[2] + ']').join(",") + ']}';
const serSeason = sk => '"' + sk + '":[\n' + SEASONS[sk].map(serClub).join(",\n") + '\n]';
const out = "/* Gecureerde kernselecties per Eredivisie-seizoen (2010/11 - 2025/26).\n"
  + "   Formaat: {n: clubnaam, a: afkorting, p: [[naam, positie, rating], ...]}\n"
  + "   Posities: GK RB CB LB DM CM AM LW RW ST\n"
  + "   2012/13-2025/26 aangevuld uit transfermarkt-datasets (tools/build-db.js);\n"
  + "   2010/11-2011/12 uit geplakte Transfermarkt-kaders (tools/parse-tm-file.js), cap " + CAP + ";\n"
  + "   ratings (65-99) afgeleid uit marktwaarde. Ontbrekende posities worden in app.js\n"
  + "   automatisch aangevuld met jeugdspelers. */\n"
  + "const SEASONS = {\n\n"
  + Object.keys(SEASONS).map(serSeason).join(",\n\n")
  + "\n};\n";

console.error("== " + seasonKey + " ==");
report.forEach(r => console.error("  " + r));
console.error("totaal toegevoegd: " + totAdd);
if(DRY) console.error("(dry run - niets geschreven)");
else { fs.writeFileSync(path.join(ROOT, "js", "data.js"), out); console.error("js/data.js geschreven."); }
