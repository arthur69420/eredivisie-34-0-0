/* Analyseert js/data.js: hoeveel echte spelers heeft elke club per seizoen.
   Een club telt als compleet bij minimaal MIN_SQUAD echte spelers (een basiself);
   niet elke positie hoeft gevuld te zijn.
   Draaien vanuit de repo-root:  node tools/analyse-db.js
   Schrijft DATABASE.md en print een samenvatting. */
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = fs.readFileSync(path.join(root, "js", "data.js"), "utf8");
const SEASONS = new Function(src + "; return SEASONS;")();

const MIN_SQUAD = 11; // genoeg echte spelers voor een basiself
const isJeugd = pl => String(pl[0]).indexOf("Jeugdspeler") === 0;

const rows = [];
for(const [season, clubsArr] of Object.entries(SEASONS)){
  for(const c of clubsArr){
    const players = c.p.filter(pl => !isJeugd(pl)).length;
    rows.push({ season, club: c.n, players, complete: players >= MIN_SQUAD });
  }
}

const fmt = r => "| " + r.club + " | " + r.players + " | " + (r.complete ? "compleet" : "te weinig") + " |";

let md = "# Databasestatus per seizoen\n\n";
md += "Automatisch gegenereerd met `node tools/analyse-db.js`. ";
md += "Een club telt als **compleet** bij minimaal " + MIN_SQUAD + " echte spelers (een basiself). ";
md += "Niet elke positie hoeft gevuld te zijn.\n\n";

const seasons = Object.keys(SEASONS);
const totals = { players: 0, complete: 0, clubs: rows.length };

for(const s of seasons){
  const rs = rows.filter(r => r.season === s).sort((a, b) => a.players - b.players);
  const complete = rs.filter(r => r.complete).length;
  totals.complete += complete;
  rs.forEach(r => totals.players += r.players);
  md += "## " + s + " — " + complete + "/" + rs.length + " clubs compleet\n\n";
  md += "| Club | Spelers | Status |\n|---|---|---|\n";
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
  const complete = rs.filter(r => r.complete).length;
  console.log(s + ": " + complete + "/" + rs.length + " compleet · dunste selecties: "
    + rs.slice().sort((a, b) => a.players - b.players).slice(0, 3).map(r => r.club + " (" + r.players + ")").join(", "));
}
console.log("\nDATABASE.md geschreven.");
