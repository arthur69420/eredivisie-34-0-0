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

/* ================= data voorbereiden ================= */
const PAD_REQ = [["GK",1],["RB",1],["CB",2],["LB",1],["CM",2],["LW",1],["RW",1],["ST",1]];
Object.values(SEASONS).forEach(clubsArr => clubsArr.forEach(c => {
  PAD_REQ.forEach(([pos, n]) => {
    const have = c.p.filter(pl => pl[1] === pos).length;
    for(let k = have; k < n; k++) c.p.push(["Jeugdspeler ("+c.a+")", pos, 62]);
  });
  const avg = arr => arr.length ? arr.reduce((s,pl) => s + pl[2], 0) / arr.length : 64;
  c.s   = avg(c.p);
  c.att = avg(c.p.filter(pl => ATTPOS.includes(pl[1])));
  c.def = avg(c.p.filter(pl => DEFPOS.includes(pl[1])));
}));

/* ================= state ================= */
let season = Object.keys(SEASONS)[Object.keys(SEASONS).length - 1];
let formation = "4-3-3";
let stijl = "Gebalanceerd";
let phase = "setup";
let teamName = "Mijn XI";
let picks = Array(11).fill(null);
let pickedCount = 0;
let picked = new Set();
let rerolls = MAX_REROLLS;
let currentClub = null;
let spinTimer = null, revealTimer = null, tableTimer = null, replacedClub = null;

const $ = id => document.getElementById(id);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const clubs = () => SEASONS[season];

/* ================= setup UI ================= */
function buildOptions(containerId, items, current, onpick){
  const el = $(containerId);
  el.innerHTML = "";
  items.forEach(it => {
    const b = document.createElement("button");
    b.className = "opt" + (it === current ? " active" : "");
    b.textContent = it;
    b.onclick = () => { if(phase !== "setup") return; onpick(it); refreshSetup(); };
    el.appendChild(b);
  });
}
function buildSeasonSelect(){
  const sel = $("seasonsel");
  sel.innerHTML = "";
  const rOpt = document.createElement("option");
  rOpt.value = "__random__"; rOpt.textContent = "Willekeurig seizoen";
  sel.appendChild(rOpt);
  Object.keys(SEASONS).slice().reverse().forEach(s => {
    const o = document.createElement("option");
    o.value = s; o.textContent = s;
    sel.appendChild(o);
  });
  sel.value = season;
  sel.onchange = () => { if(phase !== "setup"){ sel.value = season; return; } season = sel.value; refreshSetup(); };
}
function refreshSetup(){
  buildOptions("formaties", Object.keys(FORMATIONS), formation, v => formation = v);
  buildOptions("stijlen", STIJLEN, stijl, v => stijl = v);
  $("configline").textContent = (season === "__random__" ? "Seizoen ?" : season) + " \u00B7 " + formation + " \u00B7 " + stijl;
  drawPitchSlots();
  drawBoxScore();
}
function setLocked(lock){
  $("setuppanel").classList.toggle("locked", lock);
  $("seasonsel").disabled = lock;
  $("teamname").disabled = lock;
}
function getTeamName(){
  const v = $("teamname").value.trim();
  return v ? v : "Mijn XI";
}

/* ================= veld ================= */
function drawPitchSlots(){
  document.querySelectorAll(".slot").forEach(e => e.remove());
  FORMATIONS[formation].forEach((p,i) => {
    const d = document.createElement("div");
    d.className = "slot";
    d.id = "slot"+i;
    d.style.left = p[1] + "%";
    d.style.top = p[2] + "%";
    d.textContent = p[0];
    $("pitch").appendChild(d);
  });
}
function fillSlot(i, pick){
  const d = $("slot"+i);
  d.className = "slot filled";
  d.innerHTML = '<span class="nm">'+esc(pick.name)+'</span><span class="meta">'+pick.clubA+' \u00B7 '+pick.pos+' \u00B7 '+pick.rating+'</span>';
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
      + (pk ? '<span class="c">'+pk.clubA+'</span><span class="r">'+pk.rating+'</span>' : '');
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
function eligiblePlayers(club){
  return club.p.map((pl,i) => ({pl, i}))
    .filter(o => !picked.has(club.n+"#"+o.i) && openSlotsFor(o.pl[1]).length > 0);
}
function needText(){
  const counts = {};
  FORMATIONS[formation].forEach((p,i) => { if(!picks[i]) counts[p[0]] = (counts[p[0]]||0) + 1; });
  const parts = Object.keys(counts).map(k => (counts[k] > 1 ? counts[k] + "\u00D7 " : "") + k);
  return parts.length ? "Nog open: " + parts.join(" \u00B7 ") : "";
}
function startDraft(){
  phase = "draft";
  teamName = getTeamName();
  if(season === "__random__"){ season = rnd(Object.keys(SEASONS)); $("seasonsel").value = season; }
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set(); replacedClub = null;
  rerolls = MAX_REROLLS;
  clearInterval(revealTimer); clearInterval(tableTimer);
  setLocked(true);
  $("season").classList.remove("show");
  $("finale").classList.remove("show");
  $("teamstats").classList.remove("show");
  $("simbtn").classList.remove("show");
  $("resetbtn").style.display = "block";
  $("phaseline").textContent = "Fase: draften \u00B7 " + season;
  $("hint").textContent = teamName + " draft uit seizoen " + season + ". Per ronde: rol een club, kies \u00E9\u00E9n speler. Max " + MAX_REROLLS + " rerolls.";
  refreshSetup();
  nextRoll();
}
function nextRoll(){
  drawBoxScore();
  if(pickedCount >= 11){ finishDraft(); return; }
  $("rollbtn").disabled = false;
  $("rollbtn").innerHTML = "Rol &#127922;";
}
function spinTo(excludeClubName){
  const pool = clubs().filter(c => eligiblePlayers(c).length > 0 && c.n !== excludeClubName);
  const target = rnd(pool.length ? pool : clubs().filter(c => eligiblePlayers(c).length > 0));
  currentClub = target;
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
      sn.textContent = rnd(clubs()).n;
    } else {
      clearInterval(spinTimer);
      sn.textContent = target.n;
      sn.className = "spinname landed";
      showSquad(target);
      updateRerollBtn();
    }
  }, 70);
}
function roll(){
  if(phase === "setup") startDraft();
  if(phase !== "draft") return;
  $("rollbtn").disabled = true;
  $("ovstep").textContent = "Ronde " + (pickedCount+1) + " van 11 \u00B7 " + season;
  $("ovneed").textContent = needText();
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
function showSquad(club){
  const box = $("choices");
  box.innerHTML = "";
  const wrap = document.createElement("div");
  wrap.className = "squadgroups";
  GROUPS.forEach(([label, poss]) => {
    const members = club.p.map((pl,i) => ({pl,i})).filter(o => poss.includes(o.pl[1]));
    if(!members.length) return;
    const anyOpen = members.some(o => openSlotsFor(o.pl[1]).length > 0 && !picked.has(club.n+"#"+o.i));
    const g = document.createElement("div");
    g.className = "sg";
    g.innerHTML = "<h3>" + label + (anyOpen ? "" : " <span class='full'>\u00B7 dicht</span>") + "</h3>";
    members.forEach(o => {
      const used = picked.has(club.n+"#"+o.i);
      const fits = openSlotsFor(o.pl[1]).length > 0;
      const b = document.createElement("button");
      b.className = "pchoice";
      b.disabled = used || !fits;
      b.innerHTML = "<span class='pp'>" + o.pl[1] + "</span><span class='nm'>" + esc(o.pl[0]) + (used ? " \u00B7 al gekozen" : "") + "</span><span class='rt'>" + o.pl[2] + "</span>";
      if(!b.disabled) b.onclick = () => pickPlayer(club, o.i);
      g.appendChild(b);
    });
    wrap.appendChild(g);
  });
  box.appendChild(wrap);
}
function pickPlayer(club, i){
  const pl = club.p[i];
  const opts = openSlotsFor(pl[1]);
  if(!opts.length) return;
  const natural = opts.find(o => COMPAT[o.pos][0] === pl[1]);
  const slot = (natural || opts[0]).i;
  picked.add(club.n+"#"+i);
  picks[slot] = { pos: pl[1], name: pl[0], rating: pl[2], clubN: club.n, clubA: club.a };
  fillSlot(slot, picks[slot]);
  pickedCount++;
  $("overlay").classList.remove("show");
  nextRoll();
}
function finishDraft(){
  phase = "done";
  $("rollbtn").disabled = true;
  $("rollbtn").textContent = "Elftal compleet";
  $("phaseline").textContent = "Fase: klaar voor de aftrap";
  $("hint").textContent = teamName + " staat. Simuleer het seizoen via de box score.";
}

/* ================= seizoenssimulatie (volledige competitie) ================= */
function styleMods(){
  if(stijl === "Aanvallend")  return { gf: 0.28, ga: 0.22 };
  if(stijl === "Verdedigend") return { gf: -0.20, ga: -0.26 };
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
function simulate(){
  phase = "season";
  $("phaseline").textContent = "Fase: seizoen bezig";
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
      const [gh, ga] = playMatch(h, a, mods);
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
  teams.sort((x,y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf);
  const myPos = teams.indexOf(me) + 1;

  $("season").classList.add("show");
  $("finale").classList.remove("show");
  $("seasonteam").textContent = teamName;
  $("seasonyear").textContent = season;
  $("tableyear").textContent = season;
  $("seasonsub").textContent = teamName + " neemt de plek in van " + replacedClub.n + " \u00B7 34 speelrondes";
  const grid = $("fixgrid");
  grid.innerHTML = "";
  $("season").scrollIntoView({ behavior: "smooth", block: "start" });

  let i = 0;
  clearInterval(revealTimer);
  revealTimer = setInterval(() => {
    if(i >= order.length){
      clearInterval(revealTimer);
      showFinale(teams, me, myPos);
      return;
    }
    const x = order[i];
    const res = x.mg > x.og ? "W" : (x.mg < x.og ? "V" : "G");
    const div = document.createElement("div");
    div.className = "fix " + res;
    div.innerHTML = '<div class="top"><span>R'+(i+1)+'</span><span>'+x.opp.a+' \u00B7 '+(x.home ? "T" : "U")+'</span></div>'
      + '<div class="sc">'+x.mg+'\u2013'+x.og+'</div>';
    grid.appendChild(div);
    requestAnimationFrame(() => div.classList.add("in"));
    i++;
  }, 80);
}
function showFinale(teams, me, myPos){
  phase = "done";
  $("phaseline").textContent = "Fase: seizoen afgelopen";
  const stat = (lbl, val, accent) => '<div class="stat'+(accent ? " accent" : "")+'"><div class="l">'+lbl+'</div><div class="v">'+val+'</div></div>';
  const saldo = me.gf - me.ga;
  $("statgrid").innerHTML = stat("Positie", myPos + "e", true) + stat("Gewonnen", me.w) + stat("Gelijk", me.d)
    + stat("Verloren", me.l) + stat("Doelsaldo", (saldo > 0 ? "+" : "") + saldo) + stat("Punten", me.pts, true);

  const tbl = $("standings");
  tbl.innerHTML = "<tr><th class='l' colspan='2'>Club</th><th>W</th><th>G</th><th>V</th><th>DS</th><th>Ptn</th></tr>";
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
  if(perfect)             msg = "PERFECT SEIZOEN. Vierendertig uit vierendertig \u2014 onsterfelijk.";
  else if(myPos === 1)    msg = "Kampioen van Nederland. De schaal is voor " + teamName + ".";
  else if(myPos <= 3)     msg = "Plek " + myPos + ": Champions League-voetbal volgend seizoen.";
  else if(myPos <= 7)     msg = "Plek " + myPos + ": Europees voetbal in zicht. Keurig seizoen.";
  else if(myPos <= 12)    msg = "Plek " + myPos + ": grijze middenmoot. De trommel was je niet gunstig gezind.";
  else if(myPos <= 15)    msg = "Plek " + myPos + ": lang kijken naar de onderkant van de ranglijst.";
  else                    msg = "Plek " + myPos + ": degradatiestress tot de laatste speeldag.";

  $("recordtxt").textContent = me.w + "\u2013" + me.d + "\u2013" + me.l;
  $("verdicttxt").textContent = msg;
  $("verdict").classList.toggle("perfect", perfect);
  $("finale").classList.add("show");
}

/* ================= reset & events ================= */
function resetAll(){
  clearInterval(spinTimer); clearInterval(revealTimer); clearInterval(tableTimer);
  phase = "setup";
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set();
  rerolls = MAX_REROLLS;
  setLocked(false);
  $("overlay").classList.remove("show");
  $("season").classList.remove("show");
  $("finale").classList.remove("show");
  $("teamstats").classList.remove("show");
  $("simbtn").classList.remove("show");
  $("resetbtn").style.display = "none";
  $("rollbtn").disabled = false;
  $("rollbtn").innerHTML = "Rol &#127922;";
  $("phaseline").textContent = "Fase: seizoen en opstelling kiezen";
  $("hint").textContent = "Rol een club en kies een speler uit de selectie van dat seizoen. Spelers passen alleen op hun eigen positie.";
  refreshSetup();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
$("rollbtn").onclick = roll;
$("rerollbtn").onclick = reroll;
$("resetbtn").onclick = resetAll;
$("simbtn").onclick = () => { if(pickedCount === 11) simulate(); };
$("againbtn").onclick = resetAll;
$("rerunbtn").onclick = () => { if(pickedCount === 11) simulate(); };

buildSeasonSelect();
refreshSetup();
