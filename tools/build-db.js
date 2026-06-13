/* Vult js/data.js aan met echte selecties uit de transfermarkt-datasets.
   Bestaande (handmatig gecureerde) spelers en ratings blijven ongemoeid;
   alleen ontbrekende posities/diepte worden bijgevuld met spelers die in dat
   seizoen voor die club in de Eredivisie speelden. Ratings van nieuwe spelers
   worden afgeleid uit hun marktwaarde rond dat seizoen.

   CSV's verwacht in tools/tmdata/ (zie download-stap). Draaien:
     node tools/build-db.js          # schrijft js/data.js
     node tools/build-db.js --dry    # alleen statistieken, schrijft niets
*/
"use strict";
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const DRY = process.argv.includes("--dry");
const ROOT = path.join(__dirname, "..");
const TM = path.join(__dirname, "tmdata");

/* ---- CSV-parser die quotes en komma's in velden aankan ---- */
function readCSV(file){
  const t = zlib.gunzipSync(fs.readFileSync(path.join(TM, file))).toString("utf8");
  const rows = []; let i = 0, f = "", row = [], q = false;
  while(i < t.length){
    const c = t[i];
    if(q){ if(c === '"'){ if(t[i+1] === '"'){ f += '"'; i++; } else q = false; } else f += c; }
    else { if(c === '"') q = true; else if(c === ",") { row.push(f); f = ""; }
      else if(c === "\n"){ row.push(f); rows.push(row); row = []; f = ""; }
      else if(c !== "\r") f += c; }
    i++;
  }
  if(f.length || row.length){ row.push(f); rows.push(row); }
  const head = rows.shift();
  const idx = {}; head.forEach((h, k) => idx[h] = k);
  return { rows, idx };
}

/* ---- club-id -> onze clubnaam ---- */
const CLUB = {
  132:"NAC Breda", 133:"SC Cambuur", 192:"Roda JC", 200:"FC Utrecht", 202:"FC Groningen",
  234:"Feyenoord", 235:"RKC Waalwijk", 306:"sc Heerenveen", 317:"FC Twente", 383:"PSV",
  385:"Fortuna Sittard", 403:"Willem II", 467:"NEC", 468:"Sparta Rotterdam", 499:"Vitesse",
  610:"Ajax", 642:"De Graafschap", 723:"Almere City", 724:"FC Volendam", 798:"Excelsior",
  1090:"AZ", 1268:"ADO Den Haag", 1269:"PEC Zwolle", 1283:"FC Emmen", 1304:"Heracles Almelo",
  1426:"VVV-Venlo", 1434:"Telstar", 1435:"Go Ahead Eagles", 1455:"FC Dordrecht"
};

/* ---- positie sub_position -> onze code ---- */
const POS = {
  "Goalkeeper":"GK", "Sweeper":"CB", "Centre-Back":"CB", "Left-Back":"LB", "Right-Back":"RB",
  "Defensive Midfield":"DM", "Central Midfield":"CM", "Right Midfield":"RW", "Left Midfield":"LW",
  "Attacking Midfield":"AM", "Left Winger":"LW", "Right Winger":"RW",
  "Second Striker":"ST", "Centre-Forward":"ST"
};
const REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];

const seasonKey = y => y + "/" + String((+y + 1) % 100).padStart(2, "0");
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/[^a-z0-9]+/g, " ").trim();

/* ---- rating uit marktwaarde (alleen voor nieuwe spelers) ----
   rawRating geeft een interne schaal 60-88; scaleRating rekt die uit naar
   de speelschaal 65-99 met een lichte machtscurve, zodat de middenmoot
   realistisch blijft (65-80) maar toppers richting de 90 gaan. */
function scaleRating(r){
  const n = Math.max(0, Math.min(1, (r - 60) / 28));
  return Math.round(65 + Math.pow(n, 1.5) * 34);
}
function rawRating(mv){
  if(!mv || mv < 50000) return 64;
  const r = Math.round(62 + 6 * Math.log10(mv / 250000));
  return Math.max(60, Math.min(88, r));
}
function rating(mv){ return scaleRating(rawRating(mv)); }

/* ================= bestaande data inladen ================= */
const dataSrc = fs.readFileSync(path.join(ROOT, "js", "data.js"), "utf8");
const SEASONS = new Function(dataSrc + "; return SEASONS;")();

/* ---- eenmalige herijking van alle bestaande ratings naar de 65-99 schaal ---- */
if(process.argv.includes("--rescale")){
  let max = 0;
  Object.values(SEASONS).forEach(arr => arr.forEach(c => c.p.forEach(pl => { if(pl[2] > max) max = pl[2]; })));
  if(max > 90){ console.error("data.js lijkt al op de 65-99 schaal (max " + max + ") - niets gedaan."); process.exit(0); }
  let n = 0;
  Object.values(SEASONS).forEach(arr => arr.forEach(c => c.p.forEach(pl => { pl[2] = scaleRating(pl[2]); n++; })));
  fs.writeFileSync(path.join(ROOT, "js", "data.js"), serializeAll());
  console.error(n + " ratings herijkt naar 65-99 en js/data.js geschreven.");
  process.exit(0);
}

/* ================= games: game_id -> seizoen ================= */
console.error("games inlezen...");
const games = readCSV("games.csv.gz");
const gSeason = {};
{
  const { rows, idx } = games;
  for(const r of rows){
    if(r[idx.competition_id] !== "NL1") continue;
    gSeason[r[idx.game_id]] = +r[idx.season];
  }
}

/* ================= appearances: minuten per (seizoen,club,speler) ===== */
console.error("appearances inlezen (groot bestand)...");
const minutes = {}; // key season|club|player -> minuten
{
  const { rows, idx } = readCSV("appearances.csv.gz");
  for(const r of rows){
    if(r[idx.competition_id] !== "NL1") continue;
    const s = gSeason[r[idx.game_id]];
    if(!s) continue;
    const club = +r[idx.player_club_id];
    if(!CLUB[club]) continue;
    const key = s + "|" + club + "|" + r[idx.player_id];
    minutes[key] = (minutes[key] || 0) + (+r[idx.minutes_played] || 0);
  }
}

/* ================= players: id -> naam, positie ================= */
console.error("players inlezen...");
const pInfo = {};
{
  const { rows, idx } = readCSV("players.csv.gz");
  for(const r of rows){
    pInfo[r[idx.player_id]] = { name: r[idx.name], sub: r[idx.sub_position] };
  }
}

/* ================= valuations: dichtstbijzijnde waarde per seizoen ==== */
console.error("valuations inlezen...");
const vals = {}; // player_id -> [[ts, mv], ...]
{
  const { rows, idx } = readCSV("player_valuations.csv.gz");
  for(const r of rows){
    const mv = +r[idx.market_value_in_eur];
    if(!mv) continue;
    (vals[r[idx.player_id]] = vals[r[idx.player_id]] || []).push([Date.parse(r[idx.date]), mv]);
  }
}
function mvFor(pid, season){
  const arr = vals[pid];
  if(!arr) return 0;
  const ref = Date.parse((season + 1) + "-01-01");
  let best = arr[0];
  for(const v of arr) if(Math.abs(v[0] - ref) < Math.abs(best[0] - ref)) best = v;
  return best[1];
}

/* ================= mergen ================= */
const nameToId = {};
Object.keys(CLUB).forEach(id => nameToId[CLUB[id]] = +id);

let added = 0;
for(const skey of Object.keys(SEASONS)){
  const year = +skey.slice(0, 4);
  for(const club of SEASONS[skey]){
    const cid = nameToId[club.n];
    if(cid === undefined) continue;

    // bestaande spelers (handmatig) behouden
    const existing = club.p.filter(pl => String(pl[0]).indexOf("Jeugdspeler") !== 0);
    const have = new Set(existing.map(pl => norm(pl[0])));
    const cnt = {};
    existing.forEach(pl => cnt[pl[1]] = (cnt[pl[1]] || 0) + 1);

    // kandidaten uit transfermarkt voor dit seizoen+club
    const cand = [];
    const pref = year + "|" + cid + "|";
    for(const key in minutes){
      if(key.indexOf(pref) !== 0) continue;
      const pid = key.slice(pref.length);
      const info = pInfo[pid];
      if(!info) continue;
      const pos = POS[info.sub];
      if(!pos) continue;
      if(have.has(norm(info.name))) continue;
      cand.push({ name: info.name, pos, min: minutes[key], pid });
    }
    cand.sort((a, b) => b.min - a.min);

    const need = pos => { const req = (REQ.find(r => r[0] === pos) || [0,0])[1]; return (cnt[pos] || 0) < req; };
    const toAdd = [];
    // 1) verplichte posities afdekken
    for(const c of cand){
      if(toAdd.length + existing.length >= 18) break;
      if(need(c.pos)){ toAdd.push(c); cnt[c.pos] = (cnt[c.pos] || 0) + 1; have.add(norm(c.name)); }
    }
    // 2) diepte: vaste basiskrachten (>=540 min) tot max 18
    for(const c of cand){
      if(toAdd.length + existing.length >= 18) break;
      if(have.has(norm(c.name))) continue;
      if(c.min >= 540){ toAdd.push(c); have.add(norm(c.name)); }
    }

    toAdd.forEach(c => { club.p.push([c.name, c.pos, rating(mvFor(c.pid, year))]); added++; });
  }
}

/* ================= serialiseren ================= */
function esc(s){ return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'); }
function serClub(c){
  const players = c.p.map(pl => '["' + esc(pl[0]) + '","' + pl[1] + '",' + pl[2] + ']').join(",");
  return '{n:"' + esc(c.n) + '",a:"' + esc(c.a) + '",p:[' + players + ']}';
}
function serSeason(skey){
  return '"' + skey + '":[\n' + SEASONS[skey].map(serClub).join(",\n") + '\n]';
}
function serializeAll(){
  return "/* Gecureerde kernselecties per Eredivisie-seizoen (2010/11 - 2025/26).\n"
    + "   Formaat: {n: clubnaam, a: afkorting, p: [[naam, positie, rating], ...]}\n"
    + "   Posities: GK RB CB LB DM CM AM LW RW ST\n"
    + "   Selecties 2012/13-2025/26 aangevuld uit transfermarkt-datasets (tools/build-db.js);\n"
    + "   ratings (65-99) van aangevulde spelers afgeleid uit marktwaarde. Ontbrekende\n"
    + "   posities worden in app.js automatisch aangevuld met jeugdspelers. */\n"
    + "const SEASONS = {\n\n"
    + Object.keys(SEASONS).map(serSeason).join(",\n\n")
    + "\n};\n";
}
const out = serializeAll();

console.error("\nnieuwe spelers toegevoegd: " + added);
if(DRY){ console.error("(dry run - niets geschreven)"); }
else { fs.writeFileSync(path.join(ROOT, "js", "data.js"), out); console.error("js/data.js geschreven."); }
