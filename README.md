# 34–0–0 · De Eredivisie draft challenge

Een browser-spel: rol per ronde een willekeurige Eredivisie-club, kies een speler die past op een nog open positie in je formatie, en simuleer daarna een volledig seizoen van 34 speelrondes tegen de 17 andere clubs van dat seizoen — inclusief eindstand 1 t/m 18. Het ultieme doel: een perfect seizoen, 34–0–0.

## Spelen

Open `index.html` in een browser, of host de map als statische site (zie hieronder). Er is geen build-stap en geen server nodig; alleen de Google Fonts worden online geladen.

## Online zetten via GitHub Pages

1. Maak op GitHub een nieuwe repository (bijv. `eredivisie-34-0-0`), publiek.
2. Push de inhoud van deze map naar de repo:
   ```bash
   cd eredivisie-34-0-0
   git init
   git add .
   git commit -m "Eredivisie 34-0-0 draft challenge"
   git branch -M main
   git remote add origin git@github.com:<jouw-gebruikersnaam>/eredivisie-34-0-0.git
   git push -u origin main
   ```
3. Ga in de repo naar **Settings → Pages**, kies bij *Build and deployment* **Deploy from a branch**, selecteer branch `main` en map `/ (root)`, en sla op.
4. Na een minuut staat het spel live op `https://<jouw-gebruikersnaam>.github.io/eredivisie-34-0-0/`.

Zelf hosten kan natuurlijk ook (Nginx-container op een NAS, of elke andere statische webserver): de map serveren is genoeg.

## Spelregels

- **Setup**: kies teamnaam, formatie en speelstijl. Na de eerste rol staan deze vast. De speelstijl verschuift de linies op het veld (aanvallend hoger, verdedigend dieper) en weegt mee in de seizoenssimulatie: aanvallend scoort meer maar geeft ook meer weg, verdedigend andersom.
- **Draft**: 11 rondes. Per ronde wordt een willekeurige club uit een willekeurig seizoen (2010/11 t/m 2025/26) gespind en zie je de hele selectie. Een speler is alleen kiesbaar als er een veldpositie open is die bij zijn positie past (een spits past niet op het middenveld; een rechtsback mag wél als wingback spelen). Na het kiezen van een speler lichten de passende open posities op het veld op en kies je zelf waar hij komt te staan — of ga terug naar de selectie voor een andere speler.
- **Rerolls**: maximaal 3 per draft. Slechte club gerold? Eén klik en de trommel draait opnieuw.
- **Seizoen**: er wordt een willekeurig seizoen geloot en alle 18 teams van die jaargang (jouw draftteam vervangt een willekeurige club) spelen een dubbele competitie. Doelpunten worden getrokken uit een Poisson-verdeling op basis van aanvals- en verdedigingsratings, met thuisvoordeel en je speelstijl als modifier — ratings bepalen dus echt de uitslag. Daarna volgt de eindstand 1–18.
- **Records**: je gespeelde seizoenen, landstitels, perfecte seizoenen, beste record en beste eindpositie worden lokaal bewaard (localStorage) en verschijnen in het records-paneel.
- **Delen**: na een seizoen kopieert "Deel je seizoen" een tekst met je record en alle 34 uitslagen als 🟩🟨🟥-raster naar het klembord.
- **Geluid**: de trommel, het plaatsen van spelers en een titel of perfect seizoen hebben geluidseffecten (uit te zetten met de knop rechtsboven). Bij een kampioenschap valt er confetti; bij 34–0–0 in het goud.
- **App**: de site is een PWA — op je telefoon te installeren via "Toevoegen aan beginscherm" en daarna ook offline speelbaar.
- **Taal**: met de knop rechtsboven schakel je de hele interface tussen Nederlands en Engels (keuze wordt onthouden).

## Database

`js/data.js` bevat de selecties per seizoen: de juiste 18 clubs per jaargang met spelers per positie (`GK RB CB LB DM CM AM LW RW ST`) en een rating. De seizoenen 2012/13 t/m 2025/26 zijn aangevuld met echte selecties uit de [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets); ratings van aangevulde spelers zijn afgeleid uit hun marktwaarde rond dat seizoen. 2010/11 en 2011/12 zitten niet in die dataset en zijn handmatig gecureerd. Ontbrekende posities vult het spel automatisch aan met jeugdspelers.

### Database (her)opbouwen

`tools/build-db.js` voegt echte selecties toe vanuit de transfermarkt-datasets. Bestaande, handmatig gezette spelers en ratings blijven daarbij ongemoeid; alleen ontbrekende posities en diepte worden bijgevuld. Werkwijze:

```bash
# 1. CSV's ophalen naar tools/tmdata/ (niet in git; ~100 MB)
base="https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data"
mkdir -p tools/tmdata
for f in games appearances players player_valuations; do
  curl -s "$base/$f.csv.gz" -o "tools/tmdata/$f.csv.gz"
done

# 2. data.js (her)opbouwen — gebruik --dry om eerst alleen statistieken te zien
node tools/build-db.js

# 3. voortgang bekijken (genereert DATABASE.md)
node tools/analyse-db.js
```

Voor 2010/11 en 2011/12 (niet in de dataset) zijn de selecties opgebouwd uit van Transfermarkt geplakte kaders. Een heel seizoensbestand met alle 18 clubs (clubs gescheiden door een regel `BREAK`, clubnaam bovenaan elk blok) verwerk je met:

```bash
node tools/parse-tm-file.js "2010/11" "C:/pad/eredivisie10-11.txt"
```

Dit zet de clubs van dat seizoen eerst terug naar de gecureerde basis en vult ze dan aan tot een cap van 18 spelers: eerst de verplichte posities, daarna de hoogst gewaardeerde spelers. Ratings volgen uit de marktwaarde van dat seizoen; bestaande handmatige ratings blijven behouden. Voor één losse club is er `tools/parse-tm-paste.js`. Plak-bestanden staan buiten git.

Handmatig uitbreiden kan ook: voeg regels toe in het formaat `["Spelersnaam","POS",74]`.

## Structuur

```
index.html           pagina
css/style.css        styling (Eredivisie-stijl: navy, rood, broadcast-look)
js/data.js           seizoensdatabase
js/app.js            spellogica, simulatie, geluid, records
manifest.webmanifest PWA-manifest (installeerbaar als app)
sw.js                service worker (offline spelen)
icon.svg             app-icoon
```

Onofficieel fanproject, niet gelieerd aan de Eredivisie of de clubs.
