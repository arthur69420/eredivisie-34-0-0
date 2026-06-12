# 34–0 · De Eredivisie draft challenge

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

- **Setup**: kies teamnaam, seizoen (2010/11 t/m 2025/26 of willekeurig), formatie en speelstijl. Na de eerste rol staan deze vast.
- **Draft**: 11 rondes. Per ronde wordt een club gespind en zie je de hele selectie. Een speler is alleen kiesbaar als er een veldpositie open is die bij zijn positie past (een spits past niet op het middenveld; een rechtsback mag wél als wingback spelen).
- **Rerolls**: maximaal 3 per draft. Slechte club gerold? Eén klik en de trommel draait opnieuw.
- **Seizoen**: alle 18 teams (jouw draftteam vervangt een willekeurige club) spelen een dubbele competitie. Doelpunten worden getrokken uit een Poisson-verdeling op basis van aanvals- en verdedigingsratings, met thuisvoordeel en je speelstijl als modifier — ratings bepalen dus echt de uitslag. Daarna volgt de eindstand 1–18.

## Database

`js/data.js` bevat gecureerde kernselecties per seizoen: de juiste 18 clubs per jaargang met bekende spelers per positie (`GK RB CB LB DM CM AM LW RW ST`) en een rating. De database is **bij benadering en niet uitputtend** — ontbrekende posities vult het spel automatisch aan met jeugdspelers. Uitbreiden is simpel: voeg regels toe in het formaat

```js
["Spelersnaam","POS",74],
```

Goede bronnen om selecties compleet te maken: Transfermarkt, FBref of het Voetbal International-archief.

## Structuur

```
index.html      pagina
css/style.css   styling (Eredivisie-stijl: navy, rood, broadcast-look)
js/data.js      seizoensdatabase
js/app.js       spellogica en simulatie
```

Onofficieel fanproject, niet gelieerd aan de Eredivisie of de clubs.
