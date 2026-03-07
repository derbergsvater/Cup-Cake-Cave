# Die Cup-Cake-Höhlen

Ein buntes 2D-Jump'n'Run-Browsergame! Steuere ein Lama durch eine fantastische Höhle, die wie ein Cup-Cake aussieht.

## Schnellstart

### Option 1: Direkt im Browser offnen
Einfach `index.html` im Browser offnen (doppelklicken). Das Spiel ladt Phaser 3 automatisch via CDN.

### Option 2: Lokaler Server (empfohlen)
```bash
# Mit Python:
python -m http.server 8000

# Oder mit Node.js (npx):
npx serve .

# Oder mit PHP:
php -S localhost:8000
```
Dann im Browser `http://localhost:8000` offnen.

## Steuerung

| Taste | Aktion |
|-------|--------|
| Pfeiltasten / A, D | Laufen |
| Leertaste / Pfeil hoch / W | Springen |

## Spielmechaniken

### Gegner
- **Zuckerfliegen** - Fliegen durch die Höhle. Von oben draufspringen = fressen (+10 Punkte). Seitlicher Kontakt = Schaden.
- **Cup-Cake-Baren** - Werfen Cupcakes als Projektile. Von oben draufspringen = besiegen (+25 Punkte). Ausweichen!

### Power-ups
| Power-up | Farbe | Effekt | Dauer |
|----------|-------|--------|-------|
| Flug | Blau | Schweben und mehrfach springen | 6s |
| Extra-Leben | Pink (Herz) | +1 Leben | Permanent |
| Grosser werden | Grun (+) | Lama wird grosser | 7s |
| Schneller | Gold (Blitz) | Hohere Geschwindigkeit | 5s |
| Unbesiegbar | Lila (Stern) | Funkeln, unverwundbar | 8s |

## Projektstruktur

```
/
  index.html          - Einstiegspunkt
  README.md           - Diese Datei
  js/
    game.js           - Phaser-Konfiguration und Start
    audio.js          - Prozedurale Sound-Generierung (Web Audio API)
    assets.js         - Prozedurale Grafik-Generierung
    scenes/
      BootScene.js    - Asset-Generierung beim Start
      MenuScene.js    - Startbildschirm
      GameScene.js    - Hauptspiellogik (Steuerung, Gegner, Power-ups, Kollisionen)
      GameOverScene.js - Game-Over-Bildschirm mit Neustart
```

## Zentrale Spielmechaniken im Code

- **Steuerung & Physik**: `GameScene.js` -> `handleInput()`, Zeile ~195
- **Gegner-Spawning**: `GameScene.js` -> `spawnObjects()`, `spawnSugarFly()`, `spawnCupcakeBear()`
- **Kollisionen**: `GameScene.js` -> `eatSugarFly()`, `hitObstacle()`, `hitBear()`
- **Power-ups**: `GameScene.js` -> `collectPowerUp()`, `activateFlying()`, `activateStarPower()` etc.
- **Schwierigkeit**: `GameScene.js` -> `increaseDifficulty()` - steigt alle 15 Sekunden
- **Audio**: `audio.js` -> Alle Sounds werden prozedural via Web Audio API generiert
- **Grafiken**: `assets.js` -> Alle Sprites werden als Phaser-Texturen gezeichnet

## Technologie

- **Phaser 3.60** (via CDN)
- **Vanilla JavaScript**
- Keine externen Assets - alles wird prozedural generiert
- Keine Build-Tools notig
