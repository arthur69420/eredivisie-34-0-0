"use strict";

/* ================= configuratie ================= */
/* Balanced-basis per formatie; de speelstijl past hieronder de centrale
   middenvelder(s) aan: aanvallend -> CAM (hoger), verdedigend -> CDM (dieper). */
const FORMATIONS_BASE = {
"4-3-3":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CM",28,52],["CM",50,55],["CM",72,52],["LW",18,27],["ST",50,18],["RW",82,27]],
"4-4-2":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["LM",15,46],["CM",38,51],["CM",62,51],["RM",85,46],["ST",38,20],["ST",62,20]],
"4-2-3-1":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CM",38,58],["CM",62,58],["LM",17,38],["CAM",50,41],["RM",83,38],["ST",50,17]],
"4-2-4":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["CM",38,52],["CM",62,52],["LW",15,25],["ST",38,18],["ST",62,18],["RW",85,25]],
"3-5-2":[["GK",50,90],["CB",27,76],["CB",50,79],["CB",73,76],["LWB",10,50],["CM",32,54],["CM",50,57],["CM",68,54],["RWB",90,50],["ST",38,20],["ST",62,20]],
"5-3-2":[["GK",50,90],["LWB",10,68],["CB",30,77],["CB",50,80],["CB",70,77],["RWB",90,68],["CM",30,51],["CM",50,54],["CM",70,51],["ST",38,20],["ST",62,20]],
"4-5-1":[["GK",50,90],["LB",15,73],["CB",37,77],["CB",63,77],["RB",85,73],["LM",12,44],["CM",32,52],["CM",50,55],["CM",68,52],["RM",88,44],["ST",50,18]],
"3-4-3":[["GK",50,90],["CB",27,76],["CB",50,79],["CB",73,76],["LM",12,48],["CM",38,55],["CM",62,55],["RM",88,48],["LW",18,25],["ST",50,16],["RW",82,25]]
};
/* per formatie en stijl: [slotindex, nieuwe positie, dy, optioneel nieuwe x] */
const STYLE_RULES = {
"4-3-3":   { Aanvallend:[[6,"CAM",-11]],                          Verdedigend:[[6,"CDM",5]] },
"4-4-2":   { Aanvallend:[[6,"CAM",-9],[7,"CAM",-9]],              Verdedigend:[[6,"CDM",6],[7,"CDM",6]] },
"4-2-3-1": { Aanvallend:[[5,"CM",-5],[6,"CM",-5],[8,"CAM",-6]],   Verdedigend:[[5,"CDM",4],[6,"CDM",4]] },
"4-2-4":   { Aanvallend:[[5,"CAM",-8],[6,"CAM",-8]],              Verdedigend:[[5,"CDM",6],[6,"CDM",6]] },
"3-5-2":   { Aanvallend:[[6,"CAM",-12]],                          Verdedigend:[[6,"CDM",5]] },
"5-3-2":   { Aanvallend:[[7,"CAM",-12]],                          Verdedigend:[[7,"CDM",5]] },
"4-5-1":   { Aanvallend:[[7,"CAM",-12]],                          Verdedigend:[[7,"CDM",5]] },
"3-4-3":   { Aanvallend:[[5,"CAM",-9],[6,"CAM",-9]],              Verdedigend:[[5,"CDM",6],[6,"CDM",6]] }
};
function getFormation(name, style){
  const base = FORMATIONS_BASE[name].map(s => s.slice());
  ((STYLE_RULES[name] || {})[style] || []).forEach(([i, code, dy, nx]) => {
    base[i][0] = code;
    if(nx != null) base[i][1] = nx;
    base[i][2] = Math.max(8, Math.min(92, base[i][2] + (dy || 0)));
  });
  return base;
}
function curForm(){ return getFormation(formation, stijl); }
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
/* Per club een vereenvoudigd thuisshirt: patroon + kleuren, afgeleid van
   echte shirts (zie /shirts). p = patroon, c = kleuren (c[0] = basis). */
const KITS = {
  AJA:{p:"band",    c:["#FFFFFF","#C8102E"]},
  PSV:{p:"stripes", c:["#FFFFFF","#ED1C24"]},
  FEY:{p:"halves",  c:["#E2001A","#FFFFFF"]},
  AZ: {p:"sleeves", c:["#DD0000","#FFFFFF"]},
  TWE:{p:"solid",   c:["#E2001A","#FFFFFF"]},
  UTR:{p:"diagonal",c:["#FFFFFF","#FB4F14"]},
  HEE:{p:"stripes", c:["#FFFFFF","#1D5BA4"]},
  GRO:{p:"stripes", c:["#FFFFFF","#0A8A4F"]},
  VIT:{p:"stripes", c:["#FFD200","#1A1A1A"]},
  ROD:{p:"solid",   c:["#FFD400","#1A1A1A"]},
  NAC:{p:"sash",    c:["#FFD200","#1A1A1A"]},
  ADO:{p:"stripes", c:["#F4D000","#0A7A3D"]},
  HER:{p:"stripes", c:["#FFFFFF","#1A1A1A"]},
  NEC:{p:"halves",  c:["#E2001A","#00803D"]},
  VVV:{p:"solid",   c:["#FFE100","#1A1A1A"]},
  EXC:{p:"solid",   c:["#1A1A1A","#E30613"]},
  GRA:{p:"hoops",   c:["#FFFFFF","#1A4F9F"]},
  WIL:{p:"stripes3",c:["#FFFFFF","#E30613","#16285A"]},
  RKC:{p:"stripes", c:["#FFD500","#0066B3"]},
  PEC:{p:"hoops",   c:["#FFFFFF","#1C6FC0"]},
  CAM:{p:"sleeves", c:["#FFDD00","#1A2C7B"]},
  GAE:{p:"band",    c:["#E2001A","#FFD200"]},
  DOR:{p:"band",    c:["#FFFFFF","#0A7A3D"]},
  SPA:{p:"stripes", c:["#FFFFFF","#E30613"]},
  FOR:{p:"sleeves", c:["#F4D616","#1B6A3C"]},
  EMM:{p:"band",    c:["#E30613","#FFFFFF"]},
  VOL:{p:"solid",   c:["#F36C21","#1A1A1A"]},
  ALM:{p:"solid",   c:["#D50000","#1A1A1A"]},
  TEL:{p:"telstar", c:["#FFFFFF","#E40428","#0095D8"]}
};
function clubKit(abbr){ return KITS[abbr] || {p:"band", c:["#16285A","#FFFFFF"]}; }
function clubColors(abbr){ const c = clubKit(abbr).c; return [c[0], c[1]||c[0]]; }

let _kitSeq = 0;
function shirtSVG(abbr, size){
  const k = clubKit(abbr), c = k.c;
  const id = "kit"+(_kitSeq++);
  const BODY = "M13 1 L2 7 L6.5 15 L10.5 12.5 L10.5 34 L29.5 34 L29.5 12.5 L33.5 15 L38 7 L27 1 Q20 6.5 13 1 Z";
  const SLV_L = "M13 1 L2 7 L6.5 15 L10.5 12.5 Z";
  const SLV_R = "M27 1 L38 7 L33.5 15 L29.5 12.5 Z";
  // accenten (kraag, mouwuiteinden, onderrand) in kleur t
  const trim = t => '<path d="M13 1 Q20 6.5 27 1" fill="none" stroke="'+t+'" stroke-width="1.7"/>'
    + '<line x1="2" y1="7" x2="6.5" y2="15" stroke="'+t+'" stroke-width="2.2"/>'
    + '<line x1="38" y1="7" x2="33.5" y2="15" stroke="'+t+'" stroke-width="2.2"/>'
    + '<rect x="10.5" y="32.1" width="19" height="2" fill="'+t+'"/>';
  let inner = '<rect x="0" y="0" width="40" height="36" fill="'+c[0]+'"/>';
  switch(k.p){
    case "sleeves":
      inner += '<path d="'+SLV_L+'" fill="'+c[1]+'"/><path d="'+SLV_R+'" fill="'+c[1]+'"/>';
      break;
    case "band":
      inner += '<rect x="15.5" y="0" width="9" height="36" fill="'+c[1]+'"/>';
      break;
    case "halves":
      inner += '<rect x="20" y="0" width="20" height="36" fill="'+c[1]+'"/>';
      break;
    case "stripes":
      inner += [4,11,18,25,32].map(x=>'<rect x="'+x+'" y="0" width="3.4" height="36" fill="'+c[1]+'"/>').join("");
      break;
    case "stripes3":
      inner += [[4,1],[11,2],[18,1],[25,2],[32,1]].map(s=>'<rect x="'+s[0]+'" y="0" width="3.4" height="36" fill="'+c[s[1]]+'"/>').join("");
      break;
    case "hoops":
      inner += [5,12,19,26,33].map(y=>'<rect x="0" y="'+y+'" width="40" height="3.6" fill="'+c[1]+'"/>').join("");
      break;
    case "sash":
      inner += '<rect x="-8" y="13.5" width="56" height="7" fill="'+c[1]+'" transform="rotate(33 20 18)"/>';
      break;
    case "diagonal":
      inner += '<polygon points="0,2 38,36 0,36" fill="'+c[1]+'"/>';
      break;
    case "solid":
      if(c[1]) inner += trim(c[1]);
      break;
    case "telstar": // ene kant rood, andere kant blauw
      inner += '<path d="M13 1 Q16.5 4 20 4.4" fill="none" stroke="'+c[1]+'" stroke-width="1.7"/>'
        + '<path d="M20 4.4 Q23.5 4 27 1" fill="none" stroke="'+c[2]+'" stroke-width="1.7"/>'
        + '<line x1="2" y1="7" x2="6.5" y2="15" stroke="'+c[1]+'" stroke-width="2.2"/>'
        + '<line x1="38" y1="7" x2="33.5" y2="15" stroke="'+c[2]+'" stroke-width="2.2"/>'
        + '<rect x="10.5" y="32.1" width="9.5" height="2" fill="'+c[1]+'"/>'
        + '<rect x="20" y="32.1" width="9.5" height="2" fill="'+c[2]+'"/>';
      break;
  }
  return '<svg class="shirt" width="'+size+'" height="'+Math.round(size*0.9)+'" viewBox="0 0 40 36" aria-hidden="true">'
    + '<defs><clipPath id="'+id+'"><path d="'+BODY+'"/></clipPath></defs>'
    + '<g clip-path="url(#'+id+')">'+inner+'</g>'
    + '<path d="'+BODY+'" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.2"/>'
    + '<path d="M13 1 Q20 6.5 27 1 L25.3 2.2 Q20 6 14.7 2.2 Z" fill="rgba(0,0,0,.18)"/>'
    + '</svg>';
}
function clubDot(abbr){
  const c = clubColors(abbr);
  return '<i class="clubdot" style="background:'+c[0]+';box-shadow:inset 0 -3px 0 '+c[1]+'"></i>';
}

/* ================= data voorbereiden =================
   Geen jeugdspeler-opvulling meer: clubs gebruiken hun echte selectie.
   Niet elke club hoeft elke positie te hebben. */
Object.values(SEASONS).forEach(clubsArr => clubsArr.forEach(c => {
  const avg = arr => arr.length ? arr.reduce((s,pl) => s + pl[2], 0) / arr.length : 64;
  c.s   = avg(c.p);
  c.att = avg(c.p.filter(pl => ATTPOS.includes(pl[1])));
  c.def = avg(c.p.filter(pl => DEFPOS.includes(pl[1])));
}));

/* ================= state ================= */
let season = "?";
let formation = "4-3-3";
let stijl = "Gebalanceerd";
let hardcore = false;
try { hardcore = localStorage.getItem("e3400_hardcore") === "1"; } catch(e){}
let sandbox = false;
try { sandbox = localStorage.getItem("e3400_sandbox") === "1"; } catch(e){}
let phase = "setup";
let teamName = "Mijn XI";
let picks = Array(11).fill(null);
let pickedCount = 0;
let picked = new Set();
let pickedNames = new Set();
let rerolls = MAX_REROLLS;
let currentClub = null;
let currentSeason = null;
let pendingPick = null;
let rigArmed = false;
let draftSeasons = [], draftClubs = [];
let spinTimer = null, revealTimer = null, tableTimer = null, replacedClub = null;
let phaseKey = "phase_setup", hintKey = "hint_setup", hintArg = null;
function setPhaseLine(key){ phaseKey = key; $("phaseline").textContent = t(key); }
function setHint(key, arg){ hintKey = key; hintArg = arg; $("hint").textContent = (arg != null ? t(key, arg) : t(key)); }

const $ = id => document.getElementById(id);
const rnd = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => { a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const normName = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
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
    share:"Deel je seizoen", share_heading:"Deel je seizoen", share_image:"Delen", save_png:"Bewaar afbeelding",
    share_copy:"Kopieer tekst", saved_png:"Bewaard!", card_sub:"DE EREDIVISIE DRAFT CHALLENGE",
    card_season:"SEIZOEN", card_place:"PLAATS", card_points:"PUNTEN", card_legend:"WINST · GELIJK · VERLIES", card_squad:"ELFTAL",
    footer:"Onofficieel fanproject, niet gelieerd aan de Eredivisie of clubs. Selecties zijn gecureerde kernselecties per seizoen (2010/11–2025/26), bij benadering.",
    roll:"Rol &#127922;", squad_complete:"Elftal compleet",
    sound_on:"Geluid aanzetten", sound_off:"Geluid uitzetten",
    closed:"dicht", already:"al gekozen",
    phase_setup:"Fase: seizoen en opstelling kiezen", phase_draft:"Fase: draften",
    phase_ready:"Fase: klaar voor de aftrap", phase_season:"Fase: seizoen bezig",
    phase_done:"Fase: seizoen afgelopen", demo:"demo",
    hint_setup:"Rol elke ronde een club uit een willekeurig seizoen, kies een speler en zet hem zelf op een oplichtende positie.",
    styles:{Verdedigend:"Verdedigend",Gebalanceerd:"Gebalanceerd",Aanvallend:"Aanvallend"},
    modes:{Normaal:"Normaal",Hardcore:"Hardcore"}, mode:"Modus",
    mode_note:"Hardcore verbergt de ratings.",
    draftmode:"Draft", draftmodes:{Willekeurig:"Willekeurig",Sandbox:"Sandbox"},
    draftmode_note:"Sandbox: kies zelf elke speler i.p.v. willekeurig rollen.",
    sandbox_pick:"Kies een speler", sandbox_search:"Zoek een speler...",
    sandbox_note:"Kies een speler uit elk seizoen voor een open positie.",
    sandbox_toggle:"Sandbox: kies zelf je elftal",
    sandbox_demo:" (Sandbox — telt niet mee voor je records.)",
    shared_season:"Gedeeld seizoen · zoals gesimuleerd",
    share_link:"Kopieer link",
    groups:{Keeper:"Keeper",Verdediging:"Verdediging",Middenveld:"Middenveld",Aanval:"Aanval"},
    pos:{GK:"Keeper",RB:"Rechtsback",LB:"Linksback",CB:"Centrale verdediger",DM:"Verdedigende middenvelder",CM:"Middenvelder",AM:"Aanvallende middenvelder",LW:"Linksbuiten",RW:"Rechtsbuiten",ST:"Spits"},
    home:"Thuis", away:"Uit",
    st_pos:"Positie", st_won:"Gewonnen", st_draw:"Gelijk", st_lost:"Verloren", st_gd:"Doelsaldo", st_pts:"Punten",
    th_club:"Club", th_w:"W", th_d:"G", th_l:"V", th_gd:"DS", th_pts:"Ptn",
    rec_seasons:"Seizoenen gespeeld", rec_titles:"Landstitels", rec_perfect:"Perfecte seizoenen",
    rec_best:"Beste record", rec_finish:"Beste eindpositie",
    new_badge:" 🏅 Nieuwe badge: ", copied:"Gekopieerd!",
    no_history:"Nog geen seizoenen gespeeld.",
    missing:"mist", complete:"compleet", incomplete:"onvolledig", players:"spelers",
    all_seasons:"Alle seizoenen", all_clubs:"Alle clubs", help_title:"Uitleg",
    draft_filter:"Draftfilter", draft_filter_note:"Beperk de draft tot een of meer seizoenen en/of clubs. Niets geselecteerd = alles willekeurig.",
    seasons_label:"Seizoenen", clubs_label:"Clubs",
    filter_empty:"Geen spelers meer in dit filter voor je open posities. Pas het filter aan of begin opnieuw.",
    help_heading:"Hoe werkt het?",
    help_html:"<p><b>Doel:</b> stel een elftal samen en jaag op het perfecte seizoen: 34 gewonnen, 0 gelijk, 0 verloren — <b>34–0–0</b>.</p>"
      + "<p><b>1. Instellen.</b> Kies een teamnaam, formatie en speelstijl. De speelstijl (verdedigend / gebalanceerd / aanvallend) verschuift je linies op het veld én weegt mee in de uitslagen.</p>"
      + "<p><b>2. Draften.</b> 11 rondes lang rol je een willekeurige club uit een willekeurig seizoen (2010/11–2025/26). Kies een speler uit die selectie en zet hem zelf op een oplichtende, passende positie. Maximaal 3 rerolls per draft. Met het <b>draftfilter</b> kun je je beperken tot één seizoen en/of club.</p>"
      + "<p><b>3. Simuleren.</b> Je elftal speelt een volledig seizoen van 34 wedstrijden tegen de 18 clubs van een geloot seizoen. De ratings bepalen de kansen; daarna volgt de eindstand.</p>"
      + "<p><b>Records &amp; badges</b> worden lokaal bewaard. Met <b>\u{1F4CB}</b> bekijk je de spelersdatabase, met de <b>taalknop</b> wissel je tussen Nederlands en Engels, en met <b>\u{1F50A}</b> zet je het geluid aan/uit.</p>",
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
    ach:{kampioen:["Kampioen","Win de landstitel"],perfect:["34–0–0","Speel een perfect seizoen"],ongeslagen:["Ongeslagen","Speel een heel seizoen zonder nederlaag"],honderd:["Honderd","Haal 100 of meer punten in een seizoen"],underdog:["Underdog","Word kampioen met een teamrating onder 70"],sterrenelftal:["Sterrenelftal","Stel een elftal op met teamrating 88 of hoger"],tijdmachine:["Tijdmachine","Stel een elftal op met spelers uit 11 verschillende seizoenen"],specialist:["Specialist","Stel een elftal op met spelers uit één seizoen"],clubliefde:["Clubliefde","Zet 4 of meer spelers van dezelfde club in je elftal"],zuinig:["Eerste keer goed","Voltooi de draft zonder rerolls"],machine:["Doelpuntenmachine","Scoor 100 of meer goals in een seizoen"],waterdicht:["Waterdicht","Krijg hooguit 8 tegengoals in een seizoen"],fort:["Het Fort","Krijg hooguit 15 tegengoals in een seizoen"],degradant:["Toch onderuit","Eindig in de degradatiezone (16e of lager)"]}
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
    share:"Share your season", share_heading:"Share your season", share_image:"Share", save_png:"Save image",
    share_copy:"Copy text", saved_png:"Saved!", card_sub:"THE EREDIVISIE DRAFT CHALLENGE",
    card_season:"SEASON", card_place:"PLACE", card_points:"POINTS", card_legend:"WIN · DRAW · LOSS", card_squad:"SQUAD",
    footer:"Unofficial fan project, not affiliated with the Eredivisie or its clubs. Squads are curated core selections per season (2010/11–2025/26), approximate.",
    roll:"Roll &#127922;", squad_complete:"Squad complete",
    sound_on:"Turn sound on", sound_off:"Turn sound off",
    closed:"full", already:"already picked",
    phase_setup:"Phase: choose season and line-up", phase_draft:"Phase: drafting",
    phase_ready:"Phase: ready for kick-off", phase_season:"Phase: season in progress",
    phase_done:"Phase: season finished", demo:"demo",
    hint_setup:"Each round, roll a club from a random season, pick a player and place him on a highlighted position yourself.",
    styles:{Verdedigend:"Defensive",Gebalanceerd:"Balanced",Aanvallend:"Attacking"},
    modes:{Normaal:"Normal",Hardcore:"Hardcore"}, mode:"Mode",
    mode_note:"Hardcore hides the ratings.",
    draftmode:"Draft", draftmodes:{Willekeurig:"Random",Sandbox:"Sandbox"},
    draftmode_note:"Sandbox: pick every player yourself instead of rolling random.",
    sandbox_pick:"Pick a player", sandbox_search:"Search a player...",
    sandbox_note:"Pick any player from any season for an open position.",
    sandbox_toggle:"Sandbox: pick your own XI",
    sandbox_demo:" (Sandbox — does not count towards your records.)",
    shared_season:"Shared season · as simulated",
    share_link:"Copy link",
    groups:{Keeper:"Goalkeeper",Verdediging:"Defense",Middenveld:"Midfield",Aanval:"Attack"},
    pos:{GK:"Goalkeeper",RB:"Right-back",LB:"Left-back",CB:"Centre-back",DM:"Defensive midfielder",CM:"Midfielder",AM:"Attacking midfielder",LW:"Left winger",RW:"Right winger",ST:"Striker"},
    home:"Home", away:"Away",
    st_pos:"Position", st_won:"Won", st_draw:"Drawn", st_lost:"Lost", st_gd:"Goal diff.", st_pts:"Points",
    th_club:"Club", th_w:"W", th_d:"D", th_l:"L", th_gd:"GD", th_pts:"Pts",
    rec_seasons:"Seasons played", rec_titles:"League titles", rec_perfect:"Perfect seasons",
    rec_best:"Best record", rec_finish:"Best finish",
    new_badge:" 🏅 New badge: ", copied:"Copied!",
    no_history:"No seasons played yet.",
    missing:"missing", complete:"complete", incomplete:"incomplete", players:"players",
    all_seasons:"All seasons", all_clubs:"All clubs", help_title:"How to play",
    draft_filter:"Draft filter", draft_filter_note:"Limit the draft to one or more seasons and/or clubs. Nothing selected = all random.",
    seasons_label:"Seasons", clubs_label:"Clubs",
    filter_empty:"No more players in this filter for your open positions. Change the filter or start over.",
    help_heading:"How does it work?",
    help_html:"<p><b>Goal:</b> build an XI and chase the perfect season: 34 won, 0 drawn, 0 lost — <b>34–0–0</b>.</p>"
      + "<p><b>1. Set up.</b> Pick a team name, formation and play style. The play style (defensive / balanced / attacking) shifts your lines on the pitch and weighs into the results.</p>"
      + "<p><b>2. Draft.</b> For 11 rounds you roll a random club from a random season (2010/11–2025/26). Pick a player from that squad and place him on a highlighted, matching position. Max 3 rerolls per draft. Use the <b>draft filter</b> to limit yourself to one season and/or club.</p>"
      + "<p><b>3. Simulate.</b> Your XI plays a full 34-match season against the 18 clubs of a drawn season. Ratings drive the odds; then comes the final table.</p>"
      + "<p><b>Records &amp; badges</b> are stored locally. Use <b>\u{1F4CB}</b> for the player database, the <b>language button</b> to switch between Dutch and English, and <b>\u{1F50A}</b> to toggle sound.</p>",
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
    ach:{kampioen:["Champion","Win the league title"],perfect:["34–0–0","Play a perfect season"],ongeslagen:["Unbeaten","Go a whole season without losing"],honderd:["Century","Reach 100 or more points in a season"],underdog:["Underdog","Become champion with a team rating below 70"],sterrenelftal:["Galácticos","Field an XI rated 88 or higher"],tijdmachine:["Time machine","Field a XI with players from 11 different seasons"],specialist:["Specialist","Field an XI from a single season"],clubliefde:["Club love","Field 4 or more players from the same club"],zuinig:["First time right","Complete the draft without rerolls"],machine:["Goal machine","Score 100 or more goals in a season"],waterdicht:["Watertight","Concede at most 8 goals in a season"],fort:["The Fortress","Concede at most 15 goals in a season"],degradant:["Still relegated","Finish in the relegation zone (16th or lower)"]}
  }
};
function t(k, ...a){ const v = I18N[LANG][k]; return typeof v === "function" ? v(...a) : v; }
const styleLabel = v => I18N[LANG].styles[v] || v;
const modeLabel = v => (I18N[LANG].modes && I18N[LANG].modes[v]) || v;
const draftModeLabel = v => (I18N[LANG].draftmodes && I18N[LANG].draftmodes[v]) || v;
const grpLabel = v => I18N[LANG].groups[v] || v;
const posLabel = c => I18N[LANG].pos[c] || c;
const ord = n => I18N[LANG].ord(n);
const achName = id => I18N[LANG].ach[id][0];
const achDesc = id => I18N[LANG].ach[id][1];
function setPhaseUI(){
  if(phase === "setup"){ setPhaseLine("phase_setup"); setHint("hint_setup"); $("rollbtn").innerHTML = t("roll"); }
  else if(phase === "draft"){ setPhaseLine("phase_draft"); setHint("hint_draft", teamName); $("rollbtn").innerHTML = sandbox ? t("sandbox_pick") : t("roll"); }
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
  if($("dbseason") && $("dbseason").options.length) $("dbseason").options[0].textContent = t("all_seasons");
  if($("dbclubsel") && $("dbclubsel").options.length) $("dbclubsel").options[0].textContent = t("all_clubs");
  if(phase !== "setup" && phase !== "draft"){
    $("phaseline").textContent = t(phaseKey);
    $("hint").textContent = (hintArg != null ? t(hintKey, hintArg) : t(hintKey));
  }
  if($("overlay").classList.contains("show") && currentClub && currentSeason) showSquad(currentSeason, currentClub);
  if($("dbmodal").classList.contains("show")) refreshDb();
  if($("histmodal").classList.contains("show")) renderHistory();
  if($("helpmodal").classList.contains("show")) $("helpbody").innerHTML = t("help_html");
  if($("finale").classList.contains("show")){ relocalizeFinale(); drawShareCard(); }
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
  buildOptions("formaties", Object.keys(FORMATIONS_BASE), formation, v => formation = v);
  buildOptions("stijlen", STIJLEN, stijl, v => stijl = v, styleLabel);
  buildOptions("modes", ["Normaal", "Hardcore"], hardcore ? "Hardcore" : "Normaal", v => {
    hardcore = (v === "Hardcore");
    try { localStorage.setItem("e3400_hardcore", hardcore ? "1" : "0"); } catch(e){}
  }, modeLabel);
  if($("sandcheck")) $("sandcheck").checked = sandbox;
  document.body.classList.toggle("hardcore", hardcore);
  $("configline").textContent = formation + " \u00B7 " + styleLabel(stijl) + (hardcore ? " \u00B7 " + modeLabel("Hardcore") : "");
  drawPitchSlots();
  drawBoxScore();
}
function setLocked(lock){
  $("setuppanel").classList.toggle("locked", lock);
  $("teamname").disabled = lock;
  if($("sandtoggle")) $("sandtoggle").style.display = lock ? "none" : "flex";
  renderDraftFilter();
}

/* ---- multi-select draftfilter (seizoenen + clubs) ---- */
function toggleArr(arr, v){ const i = arr.indexOf(v); if(i < 0) arr.push(v); else arr.splice(i, 1); }
function clubsForSeasons(){
  const ss = draftSeasons.length ? draftSeasons : Object.keys(SEASONS);
  return [...new Set(ss.flatMap(s => SEASONS[s].map(c => c.n)))].sort();
}
function checkRow(label, on, onclick){
  const lb = document.createElement("label");
  lb.className = "mscheck" + (on ? " on" : "");
  lb.innerHTML = "<span class='msbox'>" + (on ? "✓" : "") + "</span><span class='mslbl'>" + esc(label) + "</span>";
  lb.onclick = e => { e.preventDefault(); onclick(); };
  return lb;
}
function summarize(arr, allLabel, total){
  if(!arr.length) return allLabel;
  if(arr.length <= 2) return arr.join(", ");
  return arr.length + " / " + total;
}
function renderDraftFilter(){
  const sm = $("seasonmenu"); if(!sm) return;
  const locked = phase !== "setup";
  sm.innerHTML = "";
  Object.keys(SEASONS).forEach(s => sm.appendChild(checkRow(s, draftSeasons.includes(s), () => {
    toggleArr(draftSeasons, s);
    const valid = new Set(clubsForSeasons()); draftClubs = draftClubs.filter(c => valid.has(c));
    renderDraftFilter();
  })));
  const cm = $("clubmenu"); cm.innerHTML = "";
  clubsForSeasons().forEach(n => cm.appendChild(checkRow(n, draftClubs.includes(n), () => { toggleArr(draftClubs, n); renderDraftFilter(); })));
  $("seasonsum").textContent = summarize(draftSeasons.slice().sort(), t("all_seasons"), Object.keys(SEASONS).length);
  $("clubsum").textContent = summarize(draftClubs.slice().sort(), t("all_clubs"), clubsForSeasons().length);
  $("seasonbtn").disabled = locked; $("clubbtn").disabled = locked;
  if(locked){ sm.classList.remove("open"); cm.classList.remove("open"); }
}
function getTeamName(){
  const v = $("teamname").value.trim();
  return v ? v : t("teamname_ph");
}

/* ================= veld ================= */
function drawPitchSlots(){
  document.querySelectorAll(".slot").forEach(e => e.remove());
  // de speelstijl bepaalt de posities zelf (zie STYLE_RULES)
  curForm().forEach((p,i) => {
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
  d.innerHTML = shirtSVG(pick.clubA, 30)
    + '<span class="nm">'+esc(pick.name)+'</span><span class="meta">'+pick.clubA+' \u00B7 '+pick.pos+'<span class="r"> \u00B7 '+pick.rating+'</span></span>';
}

/* ================= box score ================= */
function drawBoxScore(){
  const rows = $("bsrows");
  rows.innerHTML = "";
  curForm().forEach((p,i) => {
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
  const F = curForm();
  const arr = picks.map((p,i) => p ? {p, slot: F[i][0]} : null).filter(Boolean);
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
  return curForm().map((p,i) => ({pos: p[0], i}))
    .filter(o => !picks[o.i] && COMPAT[o.pos].includes(playerPos));
}
function eligiblePlayers(s, club){
  return club.p.map((pl,i) => ({pl, i}))
    .filter(o => !picked.has(s+"#"+club.n+"#"+o.i) && !pickedNames.has(normName(o.pl[0])) && openSlotsFor(o.pl[1]).length > 0);
}
function startDraft(){
  phase = "draft";
  teamName = getTeamName();
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set(); pickedNames = new Set(); replacedClub = null;
  rerolls = MAX_REROLLS;
  pendingPick = null; clearPlacement();
  clearInterval(revealTimer); clearInterval(tableTimer);
  setLocked(true);
  $("season").classList.remove("show");
  $("finale").classList.remove("show");
  $("teamstats").classList.remove("show");
  $("simbtn").classList.remove("show");
  $("resetbtn").style.display = "block";
  setPhaseLine("phase_draft");
  setHint("hint_draft", teamName);
  refreshSetup();
  nextRoll();
}
function nextRoll(){
  drawBoxScore();
  if(pickedCount >= 11){ finishDraft(); return; }
  $("rollbtn").disabled = false;
  $("rollbtn").innerHTML = sandbox ? t("sandbox_pick") : t("roll");
}
function rollSeasonClub(excludeClubName){
  const seasons = draftSeasons.length ? draftSeasons : Object.keys(SEASONS);
  for(let tries = 0; tries < 120; tries++){
    const s = rnd(seasons);
    const pool = SEASONS[s].filter(c =>
      (!draftClubs.length || draftClubs.includes(c.n)) &&
      eligiblePlayers(s, c).length > 0 &&
      (tries >= 60 || c.n !== excludeClubName));
    if(pool.length) return { s, club: rnd(pool) };
  }
  return null;
}
function spinTo(excludeClubName){
  const tc = rollSeasonClub(excludeClubName);
  if(!tc){
    clearInterval(spinTimer);
    const sn = $("spinname");
    sn.className = "spinname"; sn.textContent = "—";
    $("spinshirt").innerHTML = "";
    $("ovneed").textContent = t("filter_empty");
    $("choices").innerHTML = "";
    $("rerollbtn").classList.remove("show");
    return;
  }
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
  if(sandbox){ openSandbox(); return; }
  $("rollbtn").disabled = true;
  $("ovstep").textContent = t("round_of", pickedCount+1);
  $("ovneed").textContent = "";
  $("overlay").classList.add("show");
  spinTo(null);
}
function openSandbox(){
  $("overlay").classList.add("show");
  $("ovstep").textContent = t("round_of", pickedCount + 1);
  $("spinshirt").innerHTML = "";
  $("spinname").textContent = draftModeLabel("Sandbox");
  $("spinname").className = "spinname";
  $("ovneed").textContent = t("sandbox_note");
  $("rerollbtn").classList.remove("show");
  $("choices").innerHTML = "<input class='sandsearch' id='sandsearch' placeholder='" + esc(t("sandbox_search")) + "' autocomplete='off'><div class='sandresults' id='sandresults'></div>";
  $("sandsearch").oninput = e => renderSandbox(e.target.value);
  renderSandbox("");
  $("sandsearch").focus();
}
function renderSandbox(q){
  const qn = q.trim().toLowerCase();
  const res = [];
  outer:
  for(const s of Object.keys(SEASONS)){
    for(const club of SEASONS[s]){
      for(let i = 0; i < club.p.length; i++){
        const pl = club.p[i];
        if(isJeugd(pl) || pickedNames.has(normName(pl[0]))) continue;
        if(!openSlotsFor(pl[1]).length) continue;
        if(qn && !pl[0].toLowerCase().includes(qn)) continue;
        res.push({ s, club, i, pl });
        if(res.length > 600) break outer;
      }
    }
  }
  res.sort((a, b) => b.pl[2] - a.pl[2]);
  const box = $("sandresults");
  const top = res.slice(0, 80);
  if(!top.length){ box.innerHTML = "<p class='eyebrow' style='margin-top:12px'>" + t("filter_empty") + "</p>"; return; }
  box.innerHTML = "";
  top.forEach(o => {
    const b = document.createElement("button");
    b.className = "pchoice";
    b.innerHTML = "<span class='pp'>" + o.pl[1] + "</span><span class='nm'>" + esc(o.pl[0]) + "</span>"
      + "<span class='sandmeta'>" + clubDot(o.club.a) + o.club.a + " " + o.s.slice(2) + "</span>"
      + "<span class='rt'>" + o.pl[2] + "</span>";
    b.onclick = () => choosePlayer(o.s, o.club, o.i);
    box.appendChild(b);
  });
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
  wrap.className = "squadcols";
  const col0 = document.createElement("div"); col0.className = "sgcol";
  const col1 = document.createElement("div"); col1.className = "sgcol";
  wrap.appendChild(col0); wrap.appendChild(col1);
  // vaste plek per linie: keeper + verdediging links, middenveld + aanval rechts
  const colFor = { Keeper: col0, Verdediging: col0, Middenveld: col1, Aanval: col1 };
  GROUPS.forEach(([label, poss]) => {
    const members = club.p.map((pl,i) => ({pl,i})).filter(o => poss.includes(o.pl[1]));
    if(!members.length) return;
    const anyOpen = members.some(o => openSlotsFor(o.pl[1]).length > 0 && !picked.has(s+"#"+club.n+"#"+o.i) && !pickedNames.has(normName(o.pl[0])));
    const g = document.createElement("div");
    g.className = "sg";
    g.innerHTML = "<h3>" + grpLabel(label) + (anyOpen ? "" : " <span class='full'>\u00B7 " + t("closed") + "</span>") + "</h3>";
    members.forEach(o => {
      const used = picked.has(s+"#"+club.n+"#"+o.i) || pickedNames.has(normName(o.pl[0]));
      const fits = openSlotsFor(o.pl[1]).length > 0;
      const b = document.createElement("button");
      b.className = "pchoice" + (used ? " used" : "");
      b.disabled = used || !fits;
      b.innerHTML = "<span class='pp'>" + o.pl[1] + "</span><span class='nm'>" + esc(o.pl[0]) + "</span>"
        + (used ? "<span class='usedtag'>" + t("already") + "</span>" : "")
        + "<span class='rt'>" + o.pl[2] + "</span>";
      if(!b.disabled) b.onclick = () => choosePlayer(s, club, o.i);
      g.appendChild(b);
    });
    (colFor[label] || col0).appendChild(g);
  });
  box.appendChild(wrap);
}
function choosePlayer(s, club, i){
  const pl = club.p[i];
  const opts = openSlotsFor(pl[1]);
  if(!opts.length) return;
  pendingPick = { s, club, idx: i, pl };
  $("overlay").classList.remove("show");
  $("pbplayer").innerHTML = esc(pl[0]) + ' <span class="pb-meta">' + club.a + ' ' + s + ' · ' + posLabel(pl[1]) + '<span class="r"> · ' + pl[2] + '</span></span>';
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
  pickedNames.add(normName(pl[0]));
  picks[slotIdx] = { pos: pl[1], name: pl[0], rating: pl[2], clubN: club.n, clubA: club.a, season: s };
  fillSlot(slotIdx, picks[slotIdx]);
  pickedCount++;
  sfx.place();
  nextRoll();
  if(sandbox && pickedCount < 11 && phase === "draft") openSandbox();
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
  setPhaseLine("phase_ready");
  setHint("ready_hint", teamName);
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
  $("simbtn").classList.remove("show");
  phaseKey = "phase_season"; hintKey = "ready_hint"; hintArg = teamName;
  $("phaseline").textContent = t("phase_season") + (rig ? " · " + t("demo") : "");
  season = draftSeasons.length ? rnd(draftSeasons) : rnd(Object.keys(SEASONS));
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
  if(!rig) lastTeams = teams;

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
    div.innerHTML = '<div class="fr">R'+(i+1)+' \u00B7 '+(x.home ? t("home") : t("away"))+'</div>'
      + '<div class="fo">'+x.opp.a+'</div>'
      + '<div class="sc">'+x.mg+'\u2013'+x.og+'</div>';
    grid.appendChild(div);
    requestAnimationFrame(() => div.classList.add("in"));
    i++;
  }, 80);
}
function verdictMessage(me, myPos){
  if(me.w === 34)      return t("v_perfect");
  if(myPos === 1)      return t("v_champion", teamName);
  if(myPos <= 3)       return t("v_cl", myPos);
  if(myPos <= 7)       return t("v_eur", myPos);
  if(myPos <= 12)      return t("v_mid", myPos);
  if(myPos <= 15)      return t("v_low", myPos);
  return t("v_releg", myPos);
}
function relocalizeFinale(){
  if(!lastTeams || !lastMe || !$("finale").classList.contains("show")) return;
  const teams = lastTeams, me = lastMe, myPos = lastPos;
  if(replacedClub) $("seasonsub").textContent = t("replaces", teamName, replacedClub.n);
  const stat = (lbl, val, acc) => '<div class="stat'+(acc ? " accent" : "")+'"><div class="l">'+lbl+'</div><div class="v">'+val+'</div></div>';
  const saldo = me.gf - me.ga;
  $("statgrid").innerHTML = stat(t("st_pos"), ord(myPos), true) + stat(t("st_won"), me.w) + stat(t("st_draw"), me.d)
    + stat(t("st_lost"), me.l) + stat(t("st_gd"), (saldo > 0 ? "+" : "") + saldo) + stat(t("st_pts"), me.pts, true);
  const tbl = $("standings");
  tbl.innerHTML = "<tr><th class='l' colspan='2'>" + t("th_club") + "</th><th>" + t("th_w") + "</th><th>" + t("th_d") + "</th><th>" + t("th_l") + "</th><th>" + t("th_gd") + "</th><th>" + t("th_pts") + "</th></tr>";
  teams.forEach((tm, idx) => {
    const tr = document.createElement("tr");
    tr.className = (tm.mine ? "mine " : "") + (idx < 3 ? "cl" : (idx >= 15 ? "deg" : "")) + " in";
    const ds = tm.gf - tm.ga;
    tr.innerHTML = "<td class='rank'>" + (idx+1) + "</td><td class='l'>" + esc(tm.name) + "</td>"
      + "<td>" + tm.w + "</td><td>" + tm.d + "</td><td>" + tm.l + "</td>"
      + "<td>" + (ds > 0 ? "+" : "") + ds + "</td><td><strong>" + tm.pts + "</strong></td>";
    tbl.appendChild(tr);
  });
  $("verdicttxt").textContent = verdictMessage(me, myPos);
}
function showFinale(teams, me, myPos, rig){
  phase = "done";
  setPhaseLine("phase_done");
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

  const perfect = (me.w === 34);
  let msg = verdictMessage(me, myPos);
  if(rig) msg += t("demo_note");

  $("recordtxt").textContent = me.w + "\u2013" + me.d + "\u2013" + me.l;
  $("verdicttxt").textContent = msg;
  $("verdict").classList.toggle("perfect", perfect);
  $("finale").classList.add("show");

  $("sharecard").style.display = rig ? "none" : "";
  if(!rig){
    lastMe = me; lastPos = myPos;
    if(sandbox){
      $("verdicttxt").textContent += t("sandbox_demo");
    } else {
      const nieuweBadges = updateRecords(me, myPos);
      pushHistory(me, myPos);
      if(nieuweBadges.length) $("verdicttxt").textContent += t("new_badge") + nieuweBadges.join(" · ");
    }
    drawShareCard();
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
const ACHIEVEMENTS = ["kampioen","perfect","ongeslagen","honderd","underdog","sterrenelftal","tijdmachine","specialist","clubliefde","zuinig","machine","waterdicht","fort","degradant"];
let lastOrder = null, lastMe = null, lastPos = 0, lastTeams = null;
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
  if(me.l === 0 && me.w > 0) grant("ongeslagen");
  if(me.pts >= 100) grant("honderd");
  if(ratings().tot >= 88) grant("sterrenelftal");
  if(me.ga <= 8) grant("waterdicht");
  if(new Set(xi.map(p => p.season)).size === 1) grant("specialist");
  if(myPos >= 16) grant("degradant");

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
    xi: picks.map((p, i) => ({ slot: curForm()[i][0], name: p.name, clubA: p.clubA, season: p.season, rating: p.rating }))
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

/* ---- visuele seizoenskaart (canvas) ---- */
function drawShareCard(){
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(_drawShareCard);
  else _drawShareCard();
}
function clipText(ctx, text, maxW){
  let s = String(text);
  if(ctx.measureText(s).width <= maxW) return s;
  while(s.length > 1 && ctx.measureText(s + "…").width > maxW) s = s.slice(0, -1);
  return s + "…";
}
function _drawShareCard(){
  const cv = $("sharecanvas");
  if(!cv || !lastMe || !lastOrder) return;
  const ctx = cv.getContext("2d");
  const W = cv.width, H = cv.height, me = lastMe, pos = lastPos;
  const NAVY = "#0A1430", NAVY2 = "#101D42", RED = "#E40428", MUT = "#93A0C4", WHITE = "#FFFFFF", PAD = 80;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = NAVY; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = RED;  ctx.fillRect(0, 0, W, 26);
  ctx.textBaseline = "alphabetic"; ctx.textAlign = "left";
  // logo-tab
  ctx.font = "italic 600 60px Oswald, sans-serif";
  const lg = "34–0–0", lw = ctx.measureText(lg).width;
  ctx.fillStyle = RED; ctx.fillRect(PAD - 16, 92, lw + 40, 74);
  ctx.fillStyle = WHITE; ctx.fillText(lg, PAD, 148);
  ctx.font = "500 25px 'IBM Plex Mono', monospace"; ctx.fillStyle = MUT;
  ctx.fillText(t("card_sub"), PAD, 206);
  // teamnaam (schaalt mee)
  let size = 96; ctx.fillStyle = WHITE;
  const name = (teamName || "MIJN XI").toUpperCase();
  do { ctx.font = "600 " + size + "px Oswald, sans-serif"; size -= 4; } while(ctx.measureText(name).width > W - 2 * PAD && size > 40);
  ctx.fillText(name, PAD, 312);
  ctx.font = "500 28px 'IBM Plex Mono', monospace"; ctx.fillStyle = MUT;
  ctx.fillText(t("card_season") + " " + season + " · " + ord(pos).toUpperCase() + " " + t("card_place"), PAD, 360);
  // groot record
  ctx.font = "italic 600 170px Oswald, sans-serif"; ctx.fillStyle = WHITE;
  ctx.fillText(me.w + "–" + me.d + "–" + me.l, PAD - 4, 532);
  ctx.font = "600 40px Oswald, sans-serif"; ctx.fillStyle = RED;
  ctx.fillText(me.pts + " " + t("card_points"), PAD, 590);
  // resultatengrid
  const cols = 17, gap = 9, gx = PAD, gy = 636, gw = W - 2 * PAD;
  const cell = (gw - (cols - 1) * gap) / cols;
  lastOrder.forEach((x, idx) => {
    const r = Math.floor(idx / cols), c = idx % cols;
    ctx.fillStyle = x.mg > x.og ? "#27AE60" : (x.mg < x.og ? RED : "#7E8BB0");
    ctx.fillRect(gx + c * (cell + gap), gy + r * (cell + gap), cell, cell);
  });
  let y = gy + 2 * cell + gap + 44;
  ctx.font = "500 22px 'IBM Plex Mono', monospace"; ctx.fillStyle = MUT;
  ctx.fillText(t("card_legend"), PAD, y);
  // squad (XI)
  y += 52;
  ctx.font = "600 26px Oswald, sans-serif"; ctx.fillStyle = WHITE;
  ctx.fillText(t("card_squad"), PAD, y);
  ctx.strokeStyle = RED; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(PAD, y + 12); ctx.lineTo(W - PAD, y + 12); ctx.stroke();
  const F = curForm(), lineH = 50, colW = (W - 2 * PAD - 30) / 2, topY = y + 56;
  for(let i = 0; i < 11; i++){
    const pk = picks[i]; if(!pk) continue;
    const col = i < 6 ? 0 : 1, row = i < 6 ? i : i - 6;
    const x = PAD + col * (colW + 30), ly = topY + row * lineH;
    ctx.fillStyle = NAVY2; ctx.fillRect(x, ly - 32, colW, 42);
    ctx.fillStyle = MUT; ctx.font = "600 20px 'IBM Plex Mono', monospace";
    ctx.fillText((F[i] ? F[i][0] : pk.pos).padEnd(3), x + 10, ly);
    // rating (rechts, opvallend)
    const rt = String(pk.rating);
    ctx.textAlign = "right"; ctx.font = "700 23px 'IBM Plex Mono', monospace"; ctx.fillStyle = WHITE;
    ctx.fillText(rt, x + colW - 10, ly);
    const rtW = ctx.measureText(rt).width;
    // club (links van de rating)
    const club = pk.clubA + " " + String(pk.season).slice(2);
    ctx.font = "500 18px 'IBM Plex Mono', monospace"; ctx.fillStyle = MUT;
    const clubX = x + colW - 10 - rtW - 14;
    ctx.fillText(club, clubX, ly);
    const clubW = ctx.measureText(club).width;
    // naam (links, geclipt)
    ctx.textAlign = "left"; ctx.fillStyle = WHITE; ctx.font = "600 24px Inter, sans-serif";
    const nameMax = (clubX - clubW) - (x + 62) - 12;
    ctx.fillText(clipText(ctx, pk.name, Math.max(40, nameMax)), x + 62, ly);
  }
  // footer
  ctx.textAlign = "left"; ctx.fillStyle = MUT; ctx.font = "500 22px 'IBM Plex Mono', monospace";
  ctx.fillText("34–0–0 · " + formation + " · " + styleLabel(stijl).toUpperCase() + (hardcore ? " · " + modeLabel("Hardcore").toUpperCase() : ""), PAD, H - 54);
}
function wrapText(ctx, text, x, y, maxW, lh){
  const words = String(text).split(" "); let line = "", yy = y;
  for(const w of words){
    if(ctx.measureText(line + w + " ").width > maxW && line){ ctx.fillText(line.trim(), x, yy); line = ""; yy += lh; if(yy > y + lh * 3) return; }
    line += w + " ";
  }
  ctx.fillText(line.trim(), x, yy);
}
function shareImage(){
  const cv = $("sharecanvas");
  cv.toBlob(blob => {
    if(!blob) return;
    const file = new File([blob], "34-0-0-" + season + ".png", { type: "image/png" });
    if(navigator.canShare && navigator.canShare({ files: [file] })){
      navigator.share({ files: [file], title: "34–0–0", text: teamName + " · " + season }).catch(() => {});
    } else savePng();
  }, "image/png");
}
function savePng(){
  const cv = $("sharecanvas");
  cv.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "34-0-0-" + (teamName || "team").replace(/[^a-z0-9]+/gi, "-") + "-" + season + ".png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    const b = $("savepngbtn"); b.textContent = t("saved_png"); setTimeout(() => { b.textContent = t("save_png"); }, 1600);
  }, "image/png");
}

/* ---- deelbare link (XI in de URL) ---- */
function b64e(s){ return btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function b64d(s){ s = s.replace(/-/g, "+").replace(/_/g, "/"); return decodeURIComponent(escape(atob(s))); }
function teamCode(){
  if(!lastMe || !lastTeams || !lastOrder) return "";
  const data = {
    tn: teamName, f: formation, st: stijl, hc: hardcore ? 1 : 0, sea: season, pos: lastPos,
    me: [lastMe.w, lastMe.d, lastMe.l, lastMe.gf, lastMe.ga, lastMe.pts],
    ord: lastOrder.map(x => [x.opp.a, x.home ? 1 : 0, x.mg, x.og]),
    tab: lastTeams.map(tm => [tm.name, tm.w, tm.d, tm.l, tm.gf, tm.ga, tm.pts, tm.mine ? 1 : 0]),
    p: picks.map(pk => pk ? [pk.pos, pk.name, pk.rating, pk.clubN, pk.clubA, pk.season] : 0)
  };
  return b64e(JSON.stringify(data));
}
function shareLink(){
  const code = teamCode();
  if(!code) return;
  const url = location.origin + location.pathname + "#t=" + code;
  const done = () => { const b = $("linkbtn"); if(b){ b.textContent = t("copied"); setTimeout(() => { b.textContent = t("share_link"); }, 1600); } };
  if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, () => fallbackCopy(url, done));
  else fallbackCopy(url, done);
}
function loadSharedTeam(code){
  let d; try { d = JSON.parse(b64d(code)); } catch(e){ return false; }
  if(!d || !Array.isArray(d.p) || !Array.isArray(d.tab) || !d.me) return false;
  teamName = d.tn || t("teamname_ph"); $("teamname").value = teamName;
  if(FORMATIONS_BASE[d.f]) formation = d.f;
  if(STIJLEN.includes(d.st)) stijl = d.st;
  hardcore = !!d.hc;
  season = d.sea;
  picks = d.p.map(a => a ? { pos: a[0], name: a[1], rating: a[2], clubN: a[3], clubA: a[4], season: a[5] } : null);
  pickedCount = picks.filter(Boolean).length;
  picked = new Set(); pickedNames = new Set();
  picks.forEach(pk => { if(pk) pickedNames.add(normName(pk.name)); });
  lastPos = d.pos;
  lastMe = { name: teamName, mine: true, w: d.me[0], d: d.me[1], l: d.me[2], gf: d.me[3], ga: d.me[4], pts: d.me[5] };
  lastOrder = d.ord.map(a => ({ opp: { a: a[0] }, home: !!a[1], mg: a[2], og: a[3] }));
  lastTeams = d.tab.map(a => ({ name: a[0], w: a[1], d: a[2], l: a[3], gf: a[4], ga: a[5], pts: a[6], mine: !!a[7] }));
  refreshSetup();
  picks.forEach((pk, i) => { if(pk) fillSlot(i, pk); });
  drawBoxScore();
  showTeamStats();
  renderSharedSeason();
  return true;
}
function renderSharedSeason(){
  phase = "done";
  setLocked(true);
  $("resetbtn").style.display = "block";
  $("rollbtn").disabled = true; $("rollbtn").innerHTML = t("squad_complete");
  $("simbtn").classList.remove("show");
  setPhaseLine("phase_done");
  $("season").classList.add("show");
  $("seasonteam").textContent = teamName;
  $("seasonyear").textContent = season; $("tableyear").textContent = season;
  $("seasonsub").textContent = t("shared_season");
  const grid = $("fixgrid"); grid.innerHTML = "";
  lastOrder.forEach((x, i) => {
    const res = x.mg > x.og ? "W" : (x.mg < x.og ? "V" : "G");
    const div = document.createElement("div");
    div.className = "fix " + res + " in";
    div.innerHTML = '<div class="fr">R' + (i+1) + ' · ' + (x.home ? t("home") : t("away")) + '</div><div class="fo">' + x.opp.a + '</div><div class="sc">' + x.mg + '–' + x.og + '</div>';
    grid.appendChild(div);
  });
  $("recordtxt").textContent = lastMe.w + "–" + lastMe.d + "–" + lastMe.l;
  $("verdict").classList.toggle("perfect", lastMe.w === 34);
  $("finale").classList.add("show");
  relocalizeFinale();
  $("sharecard").style.display = "";
  drawShareCard();
  $("season").scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ================= reset & events ================= */
function resetAll(){
  clearInterval(spinTimer); clearInterval(revealTimer); clearInterval(tableTimer);
  phase = "setup";
  picks = Array(11).fill(null); pickedCount = 0; picked = new Set(); pickedNames = new Set();
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
if($("againbtn")) $("againbtn").onclick = resetAll;

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
$("shareimgbtn").onclick = shareImage;
$("savepngbtn").onclick = savePng;
$("linkbtn").onclick = shareLink;
$("sandcheck").onchange = () => { sandbox = $("sandcheck").checked; try { localStorage.setItem("e3400_sandbox", sandbox ? "1" : "0"); } catch(e){} };
$("overlay").onclick = e => { if(e.target === $("overlay") && sandbox && !pendingPick) $("overlay").classList.remove("show"); };
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
const MIN_SQUAD = 11; // genoeg echte spelers voor een basiself = compleet
const POSORDER = ["GK","RB","CB","LB","DM","CM","AM","LW","RW","ST"];
const isJeugd = pl => String(pl[0]).indexOf("Jeugdspeler") === 0;
function clubCardHTML(c, seasonLabel){
  const real = c.p.filter(pl => !isJeugd(pl));
  const ok = real.length >= MIN_SQUAD;
  const rows = real.slice()
    .sort((a, b) => POSORDER.indexOf(a[1]) - POSORDER.indexOf(b[1]) || b[2] - a[2])
    .map(pl => "<div class='dbrow'><span class='p'>" + pl[1] + "</span><span class='n'>" + esc(pl[0]) + "</span><span class='r'>" + pl[2] + "</span></div>")
    .join("");
  const html = "<div class='dbclub" + (ok ? " done" : "") + "'><div class='dbclubhead'>" + shirtSVG(c.a, 34)
    + "<div class='dbclubinfo'><div class='dbname'>" + esc(c.n) + (seasonLabel ? " <span class='dbcs'>" + seasonLabel + "</span>" : "") + "</div>"
    + "<div class='dbmeta'>" + real.length + " " + t("players") + " · "
    + (ok ? "<span class='ok'>" + t("complete") + "</span>" : "<span class='mis'>" + t("incomplete") + "</span>")
    + "</div></div></div>" + rows + "</div>";
  return { ok, n: real.length, html };
}
function renderDb(){
  const fc = $("dbclubsel").value;   // "" = alle clubs
  const fseason = $("dbseason").value; // "" = alle seizoenen
  const seasons = fseason ? [fseason] : Object.keys(SEASONS).slice().reverse();
  const showDivider = !fc && !fseason;
  const showSeasonInCard = fc && !fseason;
  let html = "", compleet = 0, totaal = 0, clubs = 0;
  seasons.forEach(s => {
    const inSeason = SEASONS[s].filter(c => !fc || c.n === fc);
    if(!inSeason.length) return;
    if(showDivider) html += "<div class='dbdiv'>" + s + "</div>";
    inSeason.forEach(c => {
      const r = clubCardHTML(c, showSeasonInCard ? s : "");
      if(r.ok) compleet++;
      totaal += r.n; clubs++;
      html += r.html;
    });
  });
  $("dbgrid").innerHTML = html;
  const label = (fc || t("all_clubs")) + " · " + (fseason || t("all_seasons"));
  $("dbstats").textContent = label + " · " + t("db_stats", compleet, clubs, totaal);
}
(function initDb(){
  const allClubs = [...new Set(Object.values(SEASONS).flatMap(arr => arr.map(c => c.n)))].sort();
  const sel = $("dbseason"), csel = $("dbclubsel");
  const opt = (v, txt) => { const o = document.createElement("option"); o.value = v; o.textContent = txt; return o; };
  sel.appendChild(opt("", t("all_seasons")));
  Object.keys(SEASONS).slice().reverse().forEach(s => sel.appendChild(opt(s, s)));
  csel.appendChild(opt("", t("all_clubs")));
  allClubs.forEach(n => csel.appendChild(opt(n, n)));
  const onFilter = () => { $("dbsearch").value = ""; renderDb(); };
  sel.onchange = onFilter;
  csel.onchange = onFilter;
})();
function renderDbSearch(q){
  const hits = [];
  Object.keys(SEASONS).forEach(s => SEASONS[s].forEach(c => c.p.forEach(pl => {
    if(!isJeugd(pl) && pl[0].toLowerCase().includes(q)) hits.push({ s, c, pl });
  })));
  hits.sort((a, b) => a.pl[0].localeCompare(b.pl[0]) || a.s.localeCompare(b.s));
  $("dbstats").textContent = hits.length + " " + (hits.length === 1 ? t("res1") : t("resN")) + " " + t("in_all");
  $("dbgrid").innerHTML = hits.length ? "<div class='dbclub dbsearchresults'>" + hits.slice(0, 250).map(h =>
    "<div class='dbrow'><span class='p'>" + h.pl[1] + "</span><span class='n'>" + esc(h.pl[0]) + "</span><span class='c'>" + h.c.a + "</span><span class='s'>" + h.s + "</span><span class='r'>" + h.pl[2] + "</span></div>"
  ).join("") + "</div>" : "";
}
function refreshDb(){
  const q = $("dbsearch").value.trim().toLowerCase();
  if(q.length >= 2) renderDbSearch(q);
  else renderDb();
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
function closeHelp(){ $("helpmodal").classList.remove("show"); }
$("helpbtn").onclick = () => { $("helpbody").innerHTML = t("help_html"); $("helpmodal").classList.add("show"); };
$("helpclose").onclick = closeHelp;
$("helpmodal").onclick = e => { if(e.target === $("helpmodal")) closeHelp(); };
document.addEventListener("keydown", e => { if(e.key === "Escape"){ closeDb(); closeHist(); closeHelp(); } });

/* ================= draftfilter ================= */
$("seasonbtn").onclick = () => { if($("seasonbtn").disabled) return; $("seasonmenu").classList.toggle("open"); $("clubmenu").classList.remove("open"); };
$("clubbtn").onclick = () => { if($("clubbtn").disabled) return; $("clubmenu").classList.toggle("open"); $("seasonmenu").classList.remove("open"); };
document.addEventListener("click", e => { if(!e.target.closest(".msel")){ $("seasonmenu").classList.remove("open"); $("clubmenu").classList.remove("open"); } });
renderDraftFilter();

applyLang();
if(location.hash.indexOf("#t=") === 0){ try { loadSharedTeam(location.hash.slice(3)); } catch(e){} }
if("serviceWorker" in navigator && location.protocol !== "file:")
  navigator.serviceWorker.register("sw.js").catch(() => {});
