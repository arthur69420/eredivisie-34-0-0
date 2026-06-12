/* Analyseert js/data.js: hoeveel echte spelers heeft elke club per seizoen,
   en welke basisposities ontbreken (die nu met jeugdspelers worden opgevuld).
   Draaien vanuit de repo-root:  node tools/analyse-db.js
   Schrijft DATABASE.md en print een samenvatting. */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "js", "data.js"), "utf8");
const SEASONS = new Function(src + "; return SEASONS;")();

// minimaal nodig om een elftal zonder jeugdspelers op te stellen (zelfde als PAD_REQ in app.js)
const REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];

const rows = [];
for(const [season, clubsArr] of Object.entries(SEASONS)){
  for(const c of clubsArr){
    const cnt = {};
    c.p.forEach(pl => { cnt[pl[1]] = (cnt[pl[1]] || 0) + 1; });
    const missing = [];
    REQ.forEach(([pos, n]) => {
      const short = n - (cnt[pos] || 0);
      if(short > 0) missing.push(short > 1 ? short + "× " + pos : pos);
    });
    rows.push({ season, club: c.n, players: c.p.length, missing });
  }
}

const fmt = r => "| " + r.club + " | " + r.players + " | " + (r.missing.length ? r.missing.join(", ") : "— compleet") + " |";

let md = "# Databasestatus per seizoen\n\n";
md += "Automatisch gegenereerd met `node tools/analyse-db.js`. ";
md += "*Ontbrekend* = posities die het spel nu opvult met jeugdspelers (rating 62). ";
md += "Een club is pas “compleet” bij minimaal 1× GK/RB/LB/LW/RW/ST en 2× CB/CM.\n\n";

const seasons = Object.keys(SEASONS);
const totals = { players: 0, complete: 0, clubs: rows.length };

for(const s of seasons){
  const rs = rows.filter(r => r.season === s).sort((a, b) => a.players - b.players);
  const complete = rs.filter(r => !r.missing.length).length;
  totals.complete += complete;
  rs.forEach(r => totals.players += r.players);
  md += "## " + s + " — " + complete + "/" + rs.length + " clubs compleet\n\n";
  md += "| Club | Spelers | Ontbrekend |\n|---|---|---|\n";
  md += rs.map(fmt).join("\n") + "\n\n";
}

md += "## Totaal\n\n";
md += "- Clubs in database: " + totals.clubs + " (over " + seasons.length + " seizoenen)\n";
md += "- Spelers in database: " + totals.players + "\n";
md += "- Clubs compleet: " + totals.complete + " / " + totals.clubs + "\n";

fs.writeFileSync(path.join(root, "DATABASE.md"), md);

/* samenvatting naar console */
console.log("Seizoenen: " + seasons.length + " · clubs: " + totals.clubs + " · spelers: " + totals.players);
console.log("Compleet: " + totals.complete + "/" + totals.clubs + " clubs\n");
for(const s of seasons){
  const rs = rows.filter(r => r.season === s);
  const inc = rs.filter(r => r.missing.length);
  console.log(s + ": " + (rs.length - inc.length) + "/" + rs.length + " compleet · dunste selecties: "
    + rs.slice().sort((a, b) => a.players - b.players).slice(0, 3).map(r => r.club + " (" + r.players + ")").join(", "));
}
console.log("\nDATABASE.md geschreven.");
