"use strict";

/* ================= configuratie ================= */
const FORMATIONS = {
"4-3-3":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CM",28,52],["CDM",50,58],["CM",72,52],["LW",18,27],["ST",50,18],["RW",82,27]],
"4-4-2":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["LM",15,46],["CM",38,51],["CM",62,51],["RM",85,46],["ST",38,20],["ST",62,20]],
"4-2-3-1":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CDM",38,59],["CDM",62,59],["LM",17,38],["CAM",50,41],["RM",83,38],["ST",50,17]],
"4-2-4":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CM",38,52],["CM",62,52],["LW",15,25],["ST",38,18],["ST",62,18],["RW",85,25]],
"3-5-2":[["GK",50,90],["CB",27,76],["CB",50,79],["CB",73,76],["LWB",10,50],["CM",32,54],["CDM",50,60],["CM",68,54],["RWB",90,50],["ST",38,20],["ST",62,20]],
"5-3-2":[["GK",50,90],["LWB",10,68],["CB",30,77],["CB",50,80],["CB",70,77],["RWB",90,68],["CM",30,51],["CDM",50,57],["CM",70,51],["ST",38,20],["ST",62,20]],
"4-5-1":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["LM",12,44],["CM",32,52],["CDM",50,58],["CM",68,52],["RM",88,44],["ST",50,18]],
"3-4-3":[["GK",50,90],["CB",27,76],["CB",50,79],["CB",73,76],["LM",12,48],["CM",38,55],["CM",62,55],["RM",88,48],["LW",18,25],["ST",50,16],["RW",82,25]]
};
const COMPAT = {
  GK:["GK"],
  RB:["RB"], LB:["LB"], RWB:["RB"], LWB:["LB"], CB:["CB"],
  CDM:["DM","CM"], CM:["CM","DM","AM"], CAM:["AM","CM"],
  LM:["LW"], RM:["RW"], LW:["LW"], RW:["RW"], ST:["ST"]
};
const POSNL = {GK:"Keeper",RB:"Rechtsback",LB:"Linksback",CB:"Centrale verdediger",DM:"Verdedigende middenvelder",CM:"Middenvelder",AM:"Aanvallende middenvelder",LW:"Linksbuiten",RW:"Rechtsbuiten",ST:"Spits"};
const GROUPS = [["Keeper",["GK"]],["Verdediging",["RB","CB","LB"]],["Middenveld",["DM","CM","AM"]],["Aanval",["LW","RW","ST"]]];
const STIJLEN = ["Verdedigend","Gebalanceerd","Aanvallend"];
const ATTPOS = ["AM","LW","RW","ST"], DEFPOS = ["GK","RB","CB","LB","DM"];
const MAX_REROLLS = 3;
const CLUBCOLORS = {
  AJA:["#FFFFFF","#D2122E"], PSV:["#ED1C24","#FFFFFF"], FEY:["#E60000","#FFFFFF"],
  AZ:["#DD0000","#FFFFFF"], TWE:["#E2001A","#FFFFFF"], UTR:["#E30613","#FFFFFF"],
  HEE:["#1D5BA4","#FFFFFF"], GRO:["#009B58","#FFFFFF"], ROD:["#FFD400","#1A1A1A"],
  NAC:["#FFD700","#1A1A1A"], ADO:["#F9E300","#006A38"], HER:["#1A1A1A","#FFFFFF"],
  NEC:["#C8102E","#006837"], VIT:["#FFDD00","#1A1A1A"], VVV:["#FFE100","#1A1A1A"],
  EXC:["#E30613","#1A1A1A"], GRA:["#0053A0","#FFFFFF"], WIL:["#E30613","#1D4F9F"],
  RKC:["#FFD500","#004A99"], PEC:["#0069B4","#FFFFFF"], CAM:["#FFDD00","#003C7D"],
  GAE:["#D50032","#FFD700"], DOR:["#FFFFFF","#007A3D"], SPA:["#E30613","#FFFFFF"],
  FOR:["#F9D616","#007A53"], EMM:["#E30613","#FFFFFF"], VOL:["#F36C21","#1A1A1A"],
  ALM:["#D50000","#1A1A1A"], TEL:["#FFFFFF","#0095D8"]
};
function clubColors(abbr){ return CLUBCOLORS[abbr] || ["#16285A","#FFFFFF"]; }
function shirtSVG(abbr, size){
  const c = clubColors(abbr);
  return '<svg class="shirt" width="'+size+'" height="'+Math.round(size*0.9)+'" viewBox="0 0 40 36" aria-hidden="true">'
    + '<path d="M13 1 L2 7 L6.5 15 L10.5 12.5 L10.5 34 L29.5 34 L29.5 12.5 L33.5 15 L38 7 L27 1 Q20 6.5 13 1 Z" fill="'+c[0]+'" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>'
    + '<path d="M16 6.8 H24 V33 H16 Z" fill="'+c[1]+'"/>'
    + '<path d="M13 1 Q20 6.5 27 1 L25.3 2.2 Q20 6 14.7 2.2 Z" fill="rgba(0,0,0,.35)"/>'
    + '</svg>';
}
function clubDot(abbr){
  const c = clubColors(abbr);
  return '<i class="clubdot" style="background:'+c[0]+';box-shadow:inset 0 -3px 0 '+c[1]+'"></i>';
}

/* ================= data voorbereiden ================= */
const PAD_REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];
Object.values(SEASONS).forEach(clubsArr => clubsArr.forEach(c => {
  PAD_REQ.forEach(([pos, n]) => {
    const have = c.p.filter(pl => pl[1] === pos).length;
    for(let k = have; k < n; k++) c.p.push(["Jeugdspeler ("+c.a+")", pos, 65]);
  });
  const avg = arr => arr.length ? arr.reduce((s,pl) => s + pl[2], 0) / arr.length : 64;
  c.s   = avg(c.p);
  c.att = avg(c.p.filter(pl => ATTPOS.includes(pl[1])));
  c.def = avg(c.p.filter(pl => DEFPOS.includes(pl[1])));
}));

/* ================= state ================= */
let season = "?";
let formation = "4-3-3";
let stijl = "Gebalanceerd";
let phase = "setup";
let teamName = "Mijn XI";
let picks = Array(11).fill(null);
let pickedCount = 0;
let picked = new Set();
let rerolls = MAX_REROLLS;
let currentClub = null;
let currentSeason = null;
let pendingPick = null;
let rigArmed = false;
let spinTimer = null, revealTimer = null, tableTimer = null, replacedClub = null;

const $ = id => document.getElementById(id);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const clubs = () => SEASONS[season];

/* ================= taal / i18n ================= */
let LANG = "nl";
try { LANG = localStorage.getItem("e3400_lang") || "nl"; } catch(e){}
const I18N = {
  nl: {
    apptitle:"De Eredivisie<br>draft challenge", tagline:"Rol · Kies · Simuleer",
    db_title:"Spelersdatabase", sound_title:"Geluid",
    db_heading:"Spelersdatabase", db_search:"Zoek speler in alle seizoenen...",
    close:"Sluiten ✕", hist_heading:"Jouw teams", hist_sub:"De laatste 10 gespeelde seizoenen",
    teamname:"Teamnaam", teamname_ph:"Mijn XI", formation:"Formatie", playstyle:"Speelstijl",
    restart:"Opnieuw beginnen", your_records:"Jouw records", badges:"Badges", view_teams:"Bekijk je teams",
    pick_position:"Kies een positie op het veld", back_squad:"← Terug naar selectie",
    reroll:"Opnieuw rollen", box_score:"Box score", attack:"Aanval", defense:"Verdediging",
    team_rating:"Teamrating", simulate:"Simuleer het seizoen", season_of:"Het seizoen van",
    final_table:"Eindstand Eredivisie", draft_again:"Opnieuw draften", same_team:"Zelfde team, nieuw seizoen",
    share:"Deel je seizoen",
    footer:"Onofficieel fanproject, niet gelieerd aan de Eredivisie of clubs. Selecties zijn gecureerde kernselecties per seizoen (2010/11–2025/26), bij benadering.",
    roll:"Rol &#127922;", squad_complete:"Elftal compleet",
    sound_on:"Geluid aanzetten", sound_off:"Geluid uitzetten",
    closed:"dicht", already:"al gekozen",
    phase_setup:"Fase: seizoen en opstelling kiezen", phase_draft:"Fase: draften",
    phase_ready:"Fase: klaar voor de aftrap", phase_season:"Fase: seizoen bezig",
    phase_done:"Fase: seizoen afgelopen", demo:"demo",
    hint_setup:"Rol elke ronde een club uit een willekeurig seizoen, kies een speler en zet hem zelf op een oplichtende positie.",
    styles:{Verdedigend:"Verdedigend",Gebalanceerd:"Gebalanceerd",Aanvallend:"Aanvallend"},
    groups:{Keeper:"Keeper",Verdediging:"Verdediging",Middenveld:"Middenveld",Aanval:"Aanval"},
    pos:{GK:"Keeper",RB:"Rechtsback",LB:"Linksback",CB:"Centrale verdediger",DM:"Verdedigende middenvelder",CM:"Middenvelder",AM:"Aanvallende middenvelder",LW:"Linksbuiten",RW:"Rechtsbuiten",ST:"Spits"},
    home:"T", away:"U",
    st_pos:"Positie", st_won:"Gewonnen", st_draw:"Gelijk", st_lost:"Verloren", st_gd:"Doelsaldo", st_pts:"Punten",
    th_club:"Club", th_w:"W", th_d:"G", th_l:"V", th_gd:"DS", th_pts:"Ptn",
    rec_seasons:"Seizoenen gespeeld", rec_titles:"Landstitels", rec_perfect:"Perfecte seizoenen",
    rec_best:"Beste record", rec_finish:"Beste eindpositie",
    new_badge:" 🏅 Nieuwe badge: ", copied:"Gekopieerd!",
    no_history:"Nog geen seizoenen gespeeld.",
    missing:"mist", complete:"compleet", players:"spelers",
    res1:"resultaat", resN:"resultaten", in_all:"in alle seizoenen",
    demo_note:" (Demo — telt niet mee voor je records.)", demo_tag:" · DEMO",
    round_of:n=>"Ronde "+n+" van 11", season_label:s=>"Seizoen "+s,
    hint_draft:tn=>tn+" draft: elke ronde een club uit een willekeurig seizoen. Max "+MAX_REROLLS+" rerolls.",
    ready_hint:tn=>tn+" staat. Simuleer het seizoen via de box score.",
    replaces:(tn,c)=>tn+" neemt de plek in van "+c+" · 34 speelrondes",
    v_perfect:"PERFECT SEIZOEN. Vierendertig uit vierendertig — onsterfelijk.",
    v_champion:tn=>"Kampioen van Nederland. De schaal is voor "+tn+".",
    v_cl:p=>"Plek "+p+": Champions League-voetbal volgend seizoen.",
    v_eur:p=>"Plek "+p+": Europees voetbal in zicht. Keurig seizoen.",
    v_mid:p=>"Plek "+p+": grijze middenmoot. De trommel was je niet gunstig gezind.",
    v_low:p=>"Plek "+p+": lang kijken naar de onderkant van de ranglijst.",
    v_releg:p=>"Plek "+p+": degradatiestress tot de laatste speeldag.",
    ord:n=>n+"e",
    db_stats:(c,tot,pl)=>c+"/"+tot+" clubs compleet · "+pl+" spelers",
    hist_meta:tm=>ord(tm.pos)+" · "+tm.rec+" · "+tm.pts+" ptn · "+tm.formation+" · "+styleLabel(tm.stijl)+" · rating "+tm.rating,
    share_line2:(pos,me)=>ord(pos)+" plaats · "+me.w+"–"+me.d+"–"+me.l+" · "+me.pts+" punten",
    ach:{kampioen:["Kampioen","Win de landstitel"],perfect:["34–0–0","Speel een perfect seizoen"],underdog:["Underdog","Word kampioen met een teamrating onder 70"],tijdmachine:["Tijdmachine","Stel een elftal op met spelers uit 11 verschillende seizoenen"],clubliefde:["Clubliefde","Zet 4 of meer spelers van dezelfde club in je elftal"],zuinig:["Eerste keer goed","Voltooi de draft zonder rerolls"],machine:["Doelpuntenmachine","Scoor 100 of meer goals in een seizoen"],fort:["Het Fort","Krijg hooguit 15 tegengoals in een seizoen"]}
  },
  en: {
    apptitle:"The Eredivisie<br>draft challenge", tagline:"Roll · Pick · Simulate",
    db_title:"Player database", sound_title:"Sound",
    db_heading:"Player database", db_search:"Search player across all seasons...",
    close:"Close ✕", hist_heading:"Your teams", hist_sub:"The last 10 seasons played",
    teamname:"Team name", teamname_ph:"My XI", formation:"Formation", playstyle:"Play style",
    restart:"Start over", your_records:"Your records", badges:"Badges", view_teams:"View your teams",
    pick_position:"Pick a position on the pitch", back_squad:"← Back to squad",
    reroll:"Reroll", box_score:"Box score", attack:"Attack", defense:"Defense",
    team_rating:"Team rating", simulate:"Simulate the season", season_of:"The season of",
    final_table:"Eredivisie final table", draft_again:"Draft again", same_team:"Same team, new season",
    share:"Share your season",
    footer:"Unofficial fan project, not affiliated with the Eredivisie or its clubs. Squads are curated core selections per season (2010/11–2025/26), approximate.",
    roll:"Roll &#127922;", squad_complete:"Squad complete",
    sound_on:"Turn sound on", sound_off:"Turn sound off",
    closed:"full", already:"already picked",
    phase_setup:"Phase: choose season and line-up", phase_draft:"Phase: drafting",
    phase_ready:"Phase: ready for kick-off", phase_season:"Phase: season in progress",
    phase_done:"Phase: season finished", demo:"demo",
    hint_setup:"Each round, roll a club from a random season, pick a player and place him on a highlighted position yourself.",
    styles:{Verdedigend:"Defensive",Gebalanceerd:"Balanced",Aanvallend:"Attacking"},
    groups:{Keeper:"Goalkeeper",Verdediging:"Defense",Middenveld:"Midfield",Aanval:"Attack"},
    pos:{GK:"Goalkeeper",RB:"Right-back",LB:"Left-back",CB:"Centre-back",DM:"Defensive midfielder",CM:"Midfielder",AM:"Attacking midfielder",LW:"Left winger",RW:"Right winger",ST:"Striker"},
    home:"H", away:"A",
    st_pos:"Position", st_won:"Won", st_draw:"Drawn", st_lost:"Lost", st_gd:"Goal diff.", st_pts:"Points",
    th_club:"Club", th_w:"W", th_d:"D", th_l:"L", th_gd:"GD", th_pts:"Pts",
    rec_seasons:"Seasons played", rec_titles:"League titles", rec_perfect:"Perfect seasons",
    rec_best:"Best record", rec_finish:"Best finish",
    new_badge:" 🏅 New badge: ", copied:"Copied!",
    no_history:"No seasons played yet.",
    missing:"missing", complete:"complete", players:"players",
    res1:"result", resN:"results", in_all:"across all seasons",
    demo_note:" (Demo — does not count towards your records.)", demo_tag:" · DEMO",
    round_of:n=>"Round "+n+" of 11", season_label:s=>"Season "+s,
    hint_draft:tn=>tn+" draft: each round a club from a random season. Max "+MAX_REROLLS+" rerolls.",
    ready_hint:tn=>tn+" is set. Simulate the season via the box score.",
    replaces:(tn,c)=>tn+" takes the place of "+c+" · 34 matchdays",
    v_perfect:"PERFECT SEASON. Thirty-four out of thirty-four — immortal.",
    v_champion:tn=>"Champions of the Netherlands. The title goes to "+tn+".",
    v_cl:p=>"Position "+p+": Champions League football next season.",
    v_eur:p=>"Position "+p+": European football in sight. Solid season.",
    v_mid:p=>"Position "+p+": grey mid-table. The drum wasn't kind to you.",
    v_low:p=>"Position "+p+": staring at the bottom of the table for a while.",
    v_releg:p=>"Position "+p+": relegation stress until the final matchday.",
    ord:n=>n+(n%10===1&&n%100!==11?"st":n%10===2&&n%100!==12?"nd":n%10===3&&n%100!==13?"rd":"th"),
    db_stats:(c,tot,pl)=>c+"/"+tot+" clubs complete · "+pl+" players",
    hist_meta:tm=>ord(tm.pos)+" · "+tm.rec+" · "+tm.pts+" pts · "+tm.formation+" · "+styleLabel(tm.stijl)+" · rating "+tm.rating,
    share_line2:(pos,me)=>ord(pos)+" place · "+me.w+"–"+me.d+"–"+me.l+" · "+me.pts+" points",
    ach:{kampioen:["Champion","Win the league title"],perfect:["34–0–0","Play a perfect season"],underdog:["Underdog","Become champion with a team rating below 70"],tijdmachine:["Time machine","Field a XI with players from 11 different seasons"],clubliefde:["Club love","Field 4 or more players from the same club"],zuinig:["First time right","Complete the draft without rerolls"],machine:["Goal machine","Score 100 or more goals in a season"],fort:["The Fortress","Concede at most 15 goals in a season"]}
  }
};
function t(k, ...a){ const v = I18N[LANG][k]; return typeof v === "function" ? v(...a) : v; }
const styleLabel = v => I18N[LANG].styles[v] || v;
const grpLabel = v => I18N[LANG].groups[v] || v;
const posLabel = c => I18N[LANG].pos[c] || c;
const ord = n => I18N[LANG].ord(n);
const achName = id => I18N[LANG].ach[id][0];
const achDesc = id => I18N[LANG].ach[id][1];
function setPhaseUI(){
  if(phase === "setup"){ $("phaseline").textContent = t("phase_setup"); $("hint").textContent = t("hint_setup"); $("rollbtn").innerHTML = t("roll"); }
  else if(phase === "draft"){ $("phaseline").textContent = t("phase_draft"); $("hint").textContent = t("hint_draft", teamName); $("rollbtn").innerHTML = t("roll"); }
}
function applyLang(){
  document.documentElement.lang = LANG;
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t(el.dataset.i18n));
  document.querySelectorAll("[data-i18n-html]").forEach(el => el.innerHTML = t(el.dataset.i18nHtml));
  document.querySelectorAll("[data-i18n-ph]").forEach(el => el.placeholder = t(el.dataset.i18nPh));
  document.querySelectorAll("[data-i18n-title]").forEach(el => el.title = t(el.dataset.i18nTitle));
  $("langbtn").textContent = LANG === "nl" ? "EN" : "NL";
  setMuteIcon();
  refreshSetup();
  setPhaseUI();
  renderRecords();
  if($("dbmodal").classList.contains("show")) refreshDb();
  if($("histmodal").classList.contains("show")) renderHistory();
}

/* ================= setup UI ================= */
function buildOptions(containerId, items, current, onpick, label){
  const el = $(containerId);
  el.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.className = "opt" + (it === current ? " active" : "");
    b.textContent = label ? label(it) : it;
    b.onclick = () => { if(phase !== "setup") return; onpick(it); refreshSetup(); };
    el.appendChild(b);
  });
}
function refreshSetup(){
  buildOptions("formaties", Object.keys(FORMATIONS), formation, v => formation = v);
  buildOptions("stijlen", STIJLEN, stijl, v => stijl = v, styleLabel);
  $("configline").textContent = formation + " \u00B7 " + styleLabel(stijl);
  drawPitchSlots();
  drawBoxScore();
}
function setLocked(lock){
  $("setuppanel").classList.toggle("locked", lock);
  $("teamname").disabled = lock;
}
function getTeamName(){
  const v = $("teamname").value.trim();
  return v ? v : t("teamname_ph");
}

/* ================= veld ================= */
function drawPitchSlots(){
  document.querySelectorAll(".slot").forEach(e => e.remove());
  // speelstijl verschuift de veldspelers: aanvallend hoger, verdedigend dieper
  const shift = stijl === "Aanvallend" ? -4 : (stijl === "Verdedigend" ? 4 : 0);
  FORMATIONS[formation].forEach((p,i) => {
    const d = document.createElement("div");
    d.className = "slot";
    d.id = "slot"+i;
    d.style.left = p[1] + "%";
    d.style.top = (p[0] === "GK" ? p[2] : Math.max(8, Math.min(92, p[2] + shift))) + "%";
    d.textContent = p[0];
    $("pitch").appendChild(d);
  });
}
function fillSlot(i, pick){
  const d = $("slot"+i);
  d.className = "slot filled";
  d.innerHTML = shirtSVG(pick.clubA, 30)
    + '<span class="nm">'+esc(pick.name)+'</span><span class="meta">'+pick.clubA+' \u00B7 '+pick.pos+' \u00B7 '+pick.rating+'</span>';
}

/* ================= box score ================= */
function drawBoxScore(){
  const rows = $("bsrows");
  rows.innerHTML = "";
  FORMATIONS[formation].forEach((p,i) => {
    const pk = picks[i];
    const div = document.createElement("div");
    div.className = "bsrow" + (pk ? " filled" : "");
    div.innerHTML = '<span class="p">'+p[0]+'</span>'
      + '<span class="n">'+(pk ? esc(pk.name) : "\u2014")+'</span>'
      + (pk ? '<span class="c">'+clubDot(pk.clubA)+pk.clubA+" "+pk.season.slice(2)+'</span><span class="r">'+pk.rating+'</span>' : '');
    rows.appendChild(div);
  });
  $("bscount").textContent = pickedCount + "/11";
  if(pickedCount === 11) showTeamStats();
}
function isDefSlot(slotPos){ return ["GK","CB","RB","LB","RWB","LWB","CDM"].includes(slotPos); }
function ratings(){
  const arr = picks.map((p,i) => p ? {p, slot: FORMATIONS[formation][i][0]} : null).filter(Boolean);
  const att = arr.filter(x => !isDefSlot(x.slot)).map(x => x.p);
  const def = arr.filter(x => isDefSlot(x.slot)).map(x => x.p);
  const avg = a => a.length ? a.reduce((s,p) => s + p.rating, 0) / a.length : 64;
  return { att: avg(att), def: avg(def), tot: avg(arr.map(x => x.p)) };
}
function showTeamStats(){
  const r = ratings();
  $("teamstats").classList.add("show");
  const pct = v => Math.max(4, Math.min(100, (v - 58) / 28 * 100));
  $("attval").textContent = r.att.toFixed(1);
  $("defval").textContent = r.def.toFixed(1);
  $("totval").textContent = r.tot.toFixed(1);
  requestAnimationFrame(() => {
    $("attbar").style.width = pct(r.att) + "%";
    $("defbar").style.width = pct(r.def) + "%";
    $("totbar").style.width = pct(r.tot) + "%";
  });
  $("simbtn").classList.add("show");
}

/* ================= draft ================= */
function openSlotsFor(playerPos){
  return FORMATIONS[formation].map((p,i) => ({pos: p[0], i}))
    .filter(o => !picks[o.i] && COMPAT[o.pos].includes(playerPos));
}
function eligiblePlayers(s, club){
  return club.p.map((pl,i) => ({pl, i}))
    .filter(o => !picked.has(s+"#"+club.n+"#"+o.i) && openSlotsFor(o.pl[1]).length > 0);
}
function startDraft(){
  phase = "draft";
  teamName = getTeamName();
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set(); replacedClub = null;
  rerolls = MAX_REROLLS;
  pendingPick = null; clearPlacement();
  clearInterval(revealTimer); clearInterval(tableTimer);
  setLocked(true);
  $("season").classList.remove("show");
  $("finale").classList.remove("show");
  $("teamstats").classList.remove("show");
  $("simbtn").classList.remove("show");
  $("resetbtn").style.display = "block";
  $("phaseline").textContent = t("phase_draft");
  $("hint").textContent = t("hint_draft", teamName);
  refreshSetup();
  nextRoll();
}
function nextRoll(){
  drawBoxScore();
  if(pickedCount >= 11){ finishDraft(); return; }
  $("rollbtn").disabled = false;
  $("rollbtn").innerHTML = t("roll");
}
function rollSeasonClub(excludeClubName){
  const seasons = Object.keys(SEASONS);
  for(let tries = 0; tries < 80; tries++){
    const s = rnd(seasons);
    const pool = SEASONS[s].filter(c => eligiblePlayers(s, c).length > 0 && (tries >= 40 || c.n !== excludeClubName));
    if(pool.length) return { s, club: rnd(pool) };
  }
  return null;
}
function spinTo(excludeClubName){
  const tc = rollSeasonClub(excludeClubName);
  if(!tc) return;
  currentClub = tc.club;
  currentSeason = tc.s;
  $("choices").innerHTML = "";
  $("rerollbtn").classList.remove("show");
  const sn = $("spinname");
  sn.textContent = "\u00A0";
  sn.className = "spinname spinning";
  let ticks = 0;
  clearInterval(spinTimer);
  spinTimer = setInterval(() => {
    ticks++;
    if(ticks < 16){
      const rs = rnd(Object.keys(SEASONS));
      const c = rnd(SEASONS[rs]);
      sn.textContent = c.n;
      $("ovneed").textContent = rs;
      $("spinshirt").innerHTML = shirtSVG(c.a, 44);
      sfx.tick(ticks);
    } else {
      clearInterval(spinTimer);
      sn.textContent = tc.club.n;
      $("ovneed").textContent = t("season_label", tc.s);
      $("spinshirt").innerHTML = shirtSVG(tc.club.a, 52);
      sn.className = "spinname landed";
      sfx.land();
      showSquad(tc.s, tc.club);
      updateRerollBtn();
    }
  }, 70);
}
function roll(){
  audio();
  if(phase === "setup") startDraft();
  if(phase !== "draft") return;
  $("rollbtn").disabled = true;
  $("ovstep").textContent = t("round_of", pickedCount+1);
  $("ovneed").textContent = "";
  $("overlay").classList.add("show");
  spinTo(null);
}
function updateRerollBtn(){
  const b = $("rerollbtn");
  b.classList.add("show");
  b.disabled = rerolls <= 0;
  $("rerollcount").textContent = "(" + rerolls + ")";
}
function reroll(){
  if(phase !== "draft" || rerolls <= 0) return;
  rerolls--;
  spinTo(currentClub ? currentClub.n : null);
}
function showSquad(s, club){
  const box = $("choices");
  box.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "squadgroups";
  GROUPS.forEach(([label, poss]) => {
    const members = club.p.map((pl,i) => ({pl,i})).filter(o => poss.includes(o.pl[1]));
    if(!members.length) return;
    const anyOpen = members.some(o => openSlotsFor(o.pl[1]).length > 0 && !picked.has(s+"#"+club.n+"#"+o.i));
    const g = document.createElement("div");
    g.className = "sg";
    g.innerHTML = "<h3>" + grpLabel(label) + (anyOpen ? "" : " <span class='full'>\u00B7 " + t("closed") + "</span>") + "</h3>";
    members.forEach(o => {
      const used = picked.has(s+"#"+club.n+"#"+o.i);
      const fits = openSlotsFor(o.pl[1]).length > 0;
      const b = document.createElement("button");
      b.className = "pchoice";
      b.disabled = used || !fits;
      b.innerHTML = "<span class='pp'>" + o.pl[1] + "</span><span class='nm'>" + esc(o.pl[0]) + (used ? " \u00B7 " + t("already") : "") + "</span><span class='rt'>" + o.pl[2] + "</span>";
      if(!b.disabled) b.onclick = () => choosePlayer(s, club, o.i);
      g.appendChild(b);
    });
    wrap.appendChild(g);
  });
  box.appendChild(wrap);
}
function choosePlayer(s, club, i){
  const pl = club.p[i];
  const opts = openSlotsFor(pl[1]);
  if(!opts.length) return;
  pendingPick = { s, club, idx: i, pl };
  $("overlay").classList.remove("show");
  $("pbplayer").innerHTML = esc(pl[0]) + ' <span class="pb-meta">' + club.a + ' ' + s + ' · ' + posLabel(pl[1]) + ' · ' + pl[2] + '</span>';
  $("placebar").classList.add("show");
  $("pitch").classList.add("placing");
  opts.forEach(o => {
    const d = $("slot"+o.i);
    d.classList.add("open");
    d.onclick = () => placeAt(o.i);
  });
}
function clearPlacement(){
  document.querySelectorAll(".slot.open").forEach(d => { d.classList.remove("open"); d.onclick = null; });
  $("placebar").classList.remove("show");
  $("pitch").classList.remove("placing");
}
function placeAt(slotIdx){
  if(!pendingPick) return;
  const { s, club, idx, pl } = pendingPick;
  pendingPick = null;
  clearPlacement();
  picked.add(s+"#"+club.n+"#"+idx);
  picks[slotIdx] = { pos: pl[1], name: pl[0], rating: pl[2], clubN: club.n, clubA: club.a, season: s };
  fillSlot(slotIdx, picks[slotIdx]);
  pickedCount++;
  sfx.place();
  nextRoll();
}
function backToSquad(){
  if(!pendingPick) return;
  pendingPick = null;
  clearPlacement();
  $("overlay").classList.add("show");
}
function finishDraft(){
  phase = "done";
  $("rollbtn").disabled = true;
  $("rollbtn").innerHTML = t("squad_complete");
  $("phaseline").textContent = t("phase_ready");
  $("hint").textContent = t("ready_hint", teamName);
}

/* ================= seizoenssimulatie (volledige competitie) ================= */
function styleMods(){
  if(stijl === "Aanvallend")  return { gf: 0.35, ga: 0.28 };
  if(stijl === "Verdedigend") return { gf: -0.24, ga: -0.34 };
  return { gf: 0, ga: 0 };
}
function poisson(lambda){
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= Math.random(); } while(p > L);
  return k - 1;
}
function expGoals(att, def, home){
  return Math.max(0.15, Math.min(4.2, 1.28 + (att - def) * 0.085 + (home ? 0.18 : -0.06)));
}
function playMatch(h, a, mods){
  let lh = expGoals(h.att, a.def, true);
  let la = expGoals(a.att, h.def, false);
  if(h.mine){ lh += mods.gf; la += mods.ga; }
  if(a.mine){ la += mods.gf; lh += mods.ga; }
  return [poisson(lh), poisson(la)];
}
function simulate(rig){
  phase = "season";
  if(rig) disarmRig();
  $("phaseline").textContent = t("phase_season") + (rig ? " · " + t("demo") : "");
  season = rnd(Object.keys(SEASONS));
  replacedClub = rnd(clubs());
  const r = ratings();
  const mods = styleMods();
  const teams = [{ name: teamName, a: "JIJ", att: r.att, def: r.def, mine: true }]
    .concat(clubs().filter(c => c.n !== replacedClub.n).map(c => ({ name: c.n, a: c.a, att: c.att, def: c.def, mine: false })));
  teams.forEach(t => { t.w = 0; t.d = 0; t.l = 0; t.gf = 0; t.ga = 0; t.pts = 0; });

  const myResults = [];
  for(let i = 0; i < teams.length; i++){
    for(let j = 0; j < teams.length; j++){
      if(i === j) continue;
      const h = teams[i], a = teams[j];
      let [gh, ga] = playMatch(h, a, mods);
      if(rig && h.mine){ gh = 1 + poisson(1.4); ga = Math.min(ga, gh - 1); }
      if(rig && a.mine){ ga = 1 + poisson(1.4); gh = Math.min(gh, ga - 1); }
      h.gf += gh; h.ga += ga; a.gf += ga; a.ga += gh;
      if(gh > ga){ h.w++; a.l++; h.pts += 3; }
      else if(gh < ga){ a.w++; h.l++; a.pts += 3; }
      else { h.d++; a.d++; h.pts++; a.pts++; }
      if(h.mine) myResults.push({ opp: a, home: true,  mg: gh, og: ga });
      if(a.mine) myResults.push({ opp: h, home: false, mg: ga, og: gh });
    }
  }
  const me = teams[0];
  const order = shuffle(myResults);
  if(!rig) lastOrder = order;
  teams.sort((x,y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);
  const myPos = teams.indexOf(me) + 1;

  $("season").classList.add("show");
  $("finale").classList.remove("show");
  $("seasonteam").textContent = teamName;
  $("seasonyear").textContent = season;
  $("tableyear").textContent = season;
  $("seasonsub").textContent = t("replaces", teamName, replacedClub.n) + (rig ? t("demo_tag") : "");
  const grid = $("fixgrid");
  grid.innerHTML = "";
  $("season").scrollIntoView({ behavior: "smooth", block: "start" });

  let i = 0;
  clearInterval(revealTimer);
  revealTimer = setInterval(() => {
    if(i >= order.length){
      clearInterval(revealTimer);
      showFinale(teams, me, myPos, rig);
      return;
    }
    const x = order[i];
    const res = x.mg > x.og ? "W" : (x.mg < x.og ? "V" : "G");
    const div = document.createElement("div");
    div.className = "fix " + res;
    div.innerHTML = '<div class="top"><span>R'+(i+1)+'</span><span>'+x.opp.a+' \u00B7 '+(x.home ? t("home") : t("away"))+'</span></div>'
      + '<div class="sc">'+x.mg+'\u2013'+x.og+'</div>';
    grid.appendChild(div);
    requestAnimationFrame(() => div.classList.add("in"));
    i++;
  }, 80);
}
function showFinale(teams, me, myPos, rig){
  phase = "done";
  $("phaseline").textContent = t("phase_done");
  const stat = (lbl, val, accent) => '<div class="stat'+(accent ? " accent" : "")+'"><div class="l">'+lbl+'</div><div class="v">'+val+'</div></div>';
  const saldo = me.gf - me.ga;
  $("statgrid").innerHTML = stat(t("st_pos"), ord(myPos), true) + stat(t("st_won"), me.w) + stat(t("st_draw"), me.d)
    + stat(t("st_lost"), me.l) + stat(t("st_gd"), (saldo > 0 ? "+" : "") + saldo) + stat(t("st_pts"), me.pts, true);

  const tbl = $("standings");
  tbl.innerHTML = "<tr><th class='l' colspan='2'>" + t("th_club") + "</th><th>" + t("th_w") + "</th><th>" + t("th_d") + "</th><th>" + t("th_l") + "</th><th>" + t("th_gd") + "</th><th>" + t("th_pts") + "</th></tr>";
  teams.forEach((t, idx) => {
    const tr = document.createElement("tr");
    tr.className = (t.mine ? "mine " : "") + (idx < 3 ? "cl" : (idx >= 15 ? "deg" : ""));
    const ds = t.gf - t.ga;
    tr.innerHTML = "<td class='rank'>" + (idx+1) + "</td><td class='l'>" + esc(t.name) + "</td>"
      + "<td>" + t.w + "</td><td>" + t.d + "</td><td>" + t.l + "</td>"
      + "<td>" + (ds > 0 ? "+" : "") + ds + "</td><td><strong>" + t.pts + "</strong></td>";
    tbl.appendChild(tr);
  });
  let ri = 0;
  const trs = tbl.querySelectorAll("tr");
  clearInterval(tableTimer);
  tableTimer = setInterval(() => {
    if(ri >= trs.length){ clearInterval(tableTimer); return; }
    trs[ri].classList.add("in");
    ri++;
  }, 60);

  let msg;
  const perfect = (me.w === 34);
  if(perfect)             msg = t("v_perfect");
  else if(myPos === 1)    msg = t("v_champion", teamName);
  else if(myPos <= 3)     msg = t("v_cl", myPos);
  else if(myPos <= 7)     msg = t("v_eur", myPos);
  else if(myPos <= 12)    msg = t("v_mid", myPos);
  else if(myPos <= 15)    msg = t("v_low", myPos);
  else                    msg = t("v_releg", myPos);
  if(rig) msg += t("demo_note");

  $("recordtxt").textContent = me.w + "\u2013" + me.d + "\u2013" + me.l;
  $("verdicttxt").textContent = msg;
  $("verdict").classList.toggle("perfect", perfect);
  $("finale").classList.add("show");

  $("sharebtn").style.display = rig ? "none" : "";
  if(!rig){
    lastMe = me; lastPos = myPos;
    const nieuweBadges = updateRecords(me, myPos);
    pushHistory(me, myPos);
    if(nieuweBadges.length) $("verdicttxt").textContent += t("new_badge") + nieuweBadges.join(" · ");
  }
  if(perfect){
    sfx.perfect();
    confetti(["#F5C518","#FFE584","#FFFFFF","#E40428"], 280);
  } else if(myPos === 1){
    sfx.fanfare();
    confetti(["#E40428","#FFFFFF","#F5C518"], 160);
  }
}

/* ================= geluid (WebAudio, geen bestanden) ================= */
let AC = null;
let muted = false;
try { muted = localStorage.getItem("e3400_muted") === "1"; } catch(e){}
function audio(){
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if(!Ctx) return null;
  if(!AC) AC = new Ctx();
  if(AC.state === "suspended") AC.resume();
  return AC;
}
function tone(freq, dur, type, vol, delay){
  if(muted) return;
  const a = audio(); if(!a) return;
  const t = a.currentTime + (delay || 0);
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(a.destination);
  o.start(t); o.stop(t + dur + .03);
}
const sfx = {
  tick: n => tone(n % 2 ? 740 : 620, .045, "square", .035),
  land(){ tone(220, .22, "triangle", .12); tone(440, .3, "triangle", .09, .06); },
  place(){ tone(523, .1, "sine", .12); tone(784, .16, "sine", .1, .06); },
  fanfare(){ [523, 659, 784, 1047].forEach((f, i) => tone(f, .3, "triangle", .11, i * .14)); },
  perfect(){
    [392, 523, 659, 784, 1047, 1319].forEach((f, i) => {
      tone(f, .34, "triangle", .12, i * .12);
      tone(f * 2, .3, "sine", .05, i * .12);
    });
  }
};
function setMuteIcon(){
  $("mutebtn").textContent = muted ? "\u{1F507}" : "\u{1F50A}";
  $("mutebtn").title = muted ? t("sound_on") : t("sound_off");
}

/* ================= confetti ================= */
function confetti(colors, count){
  if(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cv = document.createElement("canvas");
  cv.className = "confetti";
  document.body.appendChild(cv);
  cv.width = innerWidth; cv.height = innerHeight;
  const ctx = cv.getContext("2d");
  const P = [];
  for(let i = 0; i < count; i++){
    P.push({
      x: Math.random() * cv.width,
      y: -20 - Math.random() * cv.height * .6,
      vx: -1.2 + Math.random() * 2.4,
      vy: 2 + Math.random() * 3.2,
      w: 5 + Math.random() * 6,
      h: 8 + Math.random() * 9,
      rot: Math.random() * Math.PI,
      vr: -.12 + Math.random() * .24,
      c: rnd(colors)
    });
  }
  function step(){
    ctx.clearRect(0, 0, cv.width, cv.height);
    let alive = false;
    P.forEach(p => {
      p.x += p.vx + Math.sin(p.y * .02);
      p.y += p.vy;
      p.rot += p.vr;
      if(p.y < cv.height + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if(alive) requestAnimationFrame(step);
    else cv.remove();
  }
  requestAnimationFrame(step);
}

/* ================= records (localStorage) ================= */
const RKEY = "e3400_records";
const ACHIEVEMENTS = ["kampioen","perfect","underdog","tijdmachine","clubliefde","zuinig","machine","fort"];
let lastOrder = null, lastMe = null, lastPos = 0;
function loadRecords(){
  try { return JSON.parse(localStorage.getItem(RKEY)); } catch(e){ return null; }
}
function updateRecords(me, myPos){
  const r = loadRecords() || { seasons:0, titles:0, perfects:0, bestPts:-1, bestRec:"", bestTeam:"", bestSeason:"", bestPos:99 };
  r.seasons++;
  if(myPos === 1) r.titles++;
  if(me.w === 34) r.perfects++;
  if(me.pts > r.bestPts){
    r.bestPts = me.pts;
    r.bestRec = me.w + "–" + me.d + "–" + me.l;
    r.bestTeam = teamName;
    r.bestSeason = season;
  }
  if(myPos < r.bestPos) r.bestPos = myPos;

  // badges
  if(!r.ach) r.ach = {};
  const nieuw = [];
  const grant = id => {
    if(r.ach[id]) return;
    r.ach[id] = true;
    nieuw.push(achName(id));
  };
  const xi = picks.filter(Boolean);
  if(myPos === 1) grant("kampioen");
  if(me.w === 34) grant("perfect");
  if(myPos === 1 && ratings().tot < 70) grant("underdog");
  if(new Set(xi.map(p => p.season)).size === 11) grant("tijdmachine");
  const perClub = {};
  xi.forEach(p => { perClub[p.clubN] = (perClub[p.clubN] || 0) + 1; });
  if(Object.keys(perClub).some(k => perClub[k] >= 4)) grant("clubliefde");
  if(rerolls === MAX_REROLLS) grant("zuinig");
  if(me.gf >= 100) grant("machine");
  if(me.ga <= 15) grant("fort");

  try { localStorage.setItem(RKEY, JSON.stringify(r)); } catch(e){}
  renderRecords();
  return nieuw;
}
function renderRecords(){
  const r = loadRecords();
  const panel = $("recordspanel");
  if(!r || !r.seasons){ panel.style.display = "none"; return; }
  panel.style.display = "block";
  const row = (l, v, gold) => '<div class="recrow'+(gold ? " gold" : "")+'"><span>'+l+'</span><span class="v">'+v+'</span></div>';
  $("recrows").innerHTML =
      row(t("rec_seasons"), r.seasons)
    + row(t("rec_titles"), r.titles)
    + row(t("rec_perfect"), r.perfects, r.perfects > 0)
    + (r.bestRec ? row(t("rec_best"), r.bestRec + " (" + r.bestSeason + ")") : "")
    + (r.bestPos < 99 ? row(t("rec_finish"), ord(r.bestPos)) : "");
  const ach = r.ach || {};
  $("achgrid").innerHTML = ACHIEVEMENTS.map(id =>
    "<span class='badge" + (ach[id] ? " earned" : "") + "' title=\"" + achDesc(id) + "\">" + achName(id) + "</span>"
  ).join("");
}

/* ================= teamgeschiedenis (localStorage) ================= */
const HKEY = "e3400_history";
function loadHistory(){
  try { return JSON.parse(localStorage.getItem(HKEY)) || []; } catch(e){ return []; }
}
function pushHistory(me, myPos){
  const h = loadHistory();
  h.unshift({
    team: teamName, season, formation, stijl,
    pos: myPos, rec: me.w + "–" + me.d + "–" + me.l, pts: me.pts,
    rating: Math.round(ratings().tot * 10) / 10,
    xi: picks.map((p, i) => ({ slot: FORMATIONS[formation][i][0], name: p.name, clubA: p.clubA, season: p.season, rating: p.rating }))
  });
  if(h.length > 10) h.length = 10;
  try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch(e){}
}
function renderHistory(){
  const h = loadHistory();
  const grid = $("histgrid");
  grid.innerHTML = h.length ? "" : "<p class='eyebrow'>" + t("no_history") + "</p>";
  h.forEach(tm => {
    const card = document.createElement("div");
    card.className = "dbclub";
    card.innerHTML = "<div class='dbclubhead'><div class='dbclubinfo'><div class='dbname'>" + esc(tm.team) + " · " + tm.season + "</div>"
      + "<div class='dbmeta'>" + t("hist_meta", tm) + "</div></div></div>"
      + tm.xi.map(p => "<div class='dbrow'><span class='p'>" + p.slot + "</span><span class='n'>" + esc(p.name) + "</span><span class='c'>" + p.clubA + " " + p.season.slice(2) + "</span><span class='r'>" + p.rating + "</span></div>").join("");
    grid.appendChild(card);
  });
}

/* ================= seizoen delen ================= */
function shareSeason(){
  if(!lastMe || !lastOrder) return;
  const sq = lastOrder.map(x => x.mg > x.og ? "\u{1F7E9}" : (x.mg < x.og ? "\u{1F7E5}" : "\u{1F7E8}"));
  const rows = [];
  for(let i = 0; i < sq.length; i += 17) rows.push(sq.slice(i, i + 17).join(""));
  const txt = "34–0–0 · " + teamName + " (" + season + ")\n"
    + t("share_line2", lastPos, lastMe) + "\n"
    + rows.join("\n");
  const done = () => {
    $("sharebtn").textContent = t("copied");
    setTimeout(() => { $("sharebtn").textContent = t("share"); }, 1600);
  };
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(txt).then(done, () => fallbackCopy(txt, done));
  } else fallbackCopy(txt, done);
}
function fallbackCopy(txt, done){
  const ta = document.createElement("textarea");
  ta.value = txt;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); done(); } catch(e){}
  ta.remove();
}

/* ================= reset & events ================= */
function resetAll(){
  clearInterval(spinTimer); clearInterval(revealTimer); clearInterval(tableTimer);
  phase = "setup";
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set();
  rerolls = MAX_REROLLS;
  pendingPick = null; clearPlacement();
  setLocked(false);
  $("overlay").classList.remove("show");
  $("season").classList.remove("show");
  $("finale").classList.remove("show");
  $("teamstats").classList.remove("show");
  $("simbtn").classList.remove("show");
  $("resetbtn").style.display = "none";
  disarmRig();
  $("rollbtn").disabled = false;
  refreshSetup();
  setPhaseUI();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("rollbtn").onclick = roll;
$("rerollbtn").onclick = reroll;
$("pbback").onclick = backToSquad;
$("resetbtn").onclick = resetAll;
$("simbtn").onclick = () => { if(pickedCount === 11) simulate(rigArmed); };
$("againbtn").onclick = resetAll;
$("rerunbtn").onclick = () => { if(pickedCount === 11) simulate(rigArmed); };

/* geheime demo-trigger: 5x snel op het 34-0-0-logo klikken wapent een
   gegarandeerd perfect seizoen (telt niet mee voor records) */
const logoEl = document.querySelector(".logo");
let logoClicks = 0, logoTimer = null;
function disarmRig(){ rigArmed = false; logoEl.classList.remove("gold"); }
logoEl.onclick = () => {
  logoClicks++;
  clearTimeout(logoTimer);
  logoTimer = setTimeout(() => { logoClicks = 0; }, 1600);
  if(logoClicks >= 5){
    logoClicks = 0;
    rigArmed = !rigArmed;
    logoEl.classList.toggle("gold", rigArmed);
    if(rigArmed) tone(1047, .15, "triangle", .1);
  }
};
$("sharebtn").onclick = shareSeason;
$("langbtn").onclick = () => {
  LANG = LANG === "nl" ? "en" : "nl";
  try { localStorage.setItem("e3400_lang", LANG); } catch(e){}
  applyLang();
};
$("mutebtn").onclick = () => {
  muted = !muted;
  try { localStorage.setItem("e3400_muted", muted ? "1" : "0"); } catch(e){}
  setMuteIcon();
  if(!muted) tone(660, .09, "sine", .1);
};

/* ================= databaseviewer ================= */
const DB_REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];
const POSORDER = ["GK","RB","CB","LB","DM","CM","AM","LW","RW","ST"];
const isJeugd = pl => String(pl[0]).indexOf("Jeugdspeler") === 0;
function dbMissing(realP){
  const cnt = {};
  realP.forEach(pl => { cnt[pl[1]] = (cnt[pl[1]] || 0) + 1; });
  const mis = [];
  DB_REQ.forEach(([pos, n]) => {
    const t = n - (cnt[pos] || 0);
    if(t > 0) mis.push(t > 1 ? t + "× " + pos : pos);
  });
  return mis;
}
function renderDb(s){
  const grid = $("dbgrid");
  grid.innerHTML = "";
  let compleet = 0, totaal = 0;
  SEASONS[s].forEach(c => {
    const real = c.p.filter(pl => !isJeugd(pl));
    const mis = dbMissing(real);
    if(!mis.length) compleet++;
    totaal += real.length;
    const rows = real.slice()
      .sort((a, b) => POSORDER.indexOf(a[1]) - POSORDER.indexOf(b[1]) || b[2] - a[2])
      .map(pl => "<div class='dbrow'><span class='p'>" + pl[1] + "</span><span class='n'>" + esc(pl[0]) + "</span><span class='r'>" + pl[2] + "</span></div>")
      .join("");
    const card = document.createElement("div");
    card.className = "dbclub" + (mis.length ? "" : " done");
    card.innerHTML = "<div class='dbclubhead'>" + shirtSVG(c.a, 34)
      + "<div class='dbclubinfo'><div class='dbname'>" + esc(c.n) + "</div>"
      + "<div class='dbmeta'>" + real.length + " " + t("players") + " · "
      + (mis.length ? "<span class='mis'>" + t("missing") + " " + mis.join(", ") + "</span>" : "<span class='ok'>" + t("complete") + "</span>")
      + "</div></div></div>" + rows;
    grid.appendChild(card);
  });
  $("dbstats").textContent = s + " · " + t("db_stats", compleet, SEASONS[s].length, totaal);
}
(function initDb(){
  const sel = $("dbseason");
  Object.keys(SEASONS).slice().reverse().forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    sel.appendChild(o);
  });
  sel.onchange = () => { $("dbsearch").value = ""; renderDb(sel.value); };
})();
function renderDbSearch(q){
  const hits = [];
  Object.keys(SEASONS).forEach(s => SEASONS[s].forEach(c => c.p.forEach(pl => {
    if(!isJeugd(pl) && pl[0].toLowerCase().includes(q)) hits.push({ s, c, pl });
  })));
  hits.sort((a, b) => a.pl[0].localeCompare(b.pl[0]) || a.s.localeCompare(b.s));
  const grid = $("dbgrid");
  grid.innerHTML = "";
  $("dbstats").textContent = hits.length + " " + (hits.length === 1 ? t("res1") : t("resN")) + " " + t("in_all");
  if(!hits.length) return;
  const card = document.createElement("div");
  card.className = "dbclub dbsearchresults";
  card.innerHTML = hits.slice(0, 250).map(h =>
    "<div class='dbrow'><span class='p'>" + h.pl[1] + "</span><span class='n'>" + esc(h.pl[0]) + "</span><span class='c'>" + h.c.a + "</span><span class='s'>" + h.s + "</span><span class='r'>" + h.pl[2] + "</span></div>"
  ).join("");
  grid.appendChild(card);
}
function refreshDb(){
  const q = $("dbsearch").value.trim().toLowerCase();
  if(q.length >= 2) renderDbSearch(q);
  else renderDb($("dbseason").value);
}
$("dbsearch").oninput = refreshDb;
function closeDb(){ $("dbmodal").classList.remove("show"); }
$("dbbtn").onclick = () => { $("dbmodal").classList.add("show"); refreshDb(); };
$("dbclose").onclick = closeDb;
$("dbmodal").onclick = e => { if(e.target === $("dbmodal")) closeDb(); };
function closeHist(){ $("histmodal").classList.remove("show"); }
$("histbtn").onclick = () => { $("histmodal").classList.add("show"); renderHistory(); };
$("histclose").onclick = closeHist;
$("histmodal").onclick = e => { if(e.target === $("histmodal")) closeHist(); };
document.addEventListener("keydown", e => { if(e.key === "Escape"){ closeDb(); closeHist(); } });

applyLang();
if("serviceWorker" in navigator && location.protocol !== "file:")
  navigator.serviceWorker.register("sw.js").catch(() => {});
