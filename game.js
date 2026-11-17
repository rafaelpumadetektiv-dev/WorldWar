
const game = {
    money: 25000,
    steel: 500,
    coal: 500,

    factories: 5,
    shipyards: 2,
    productionLevel: 1,

    ships: 0,
    planes: 0,

    date: new Date("1914-07-28T12:00:00"),
    paused: false,

    selectedCountry: "Deutschland"
};

const $ = id => document.getElementById(id);

function updateUI() {
    $("money").textContent = Math.floor(game.money).toLocaleString("de-DE");
    $("steel").textContent = game.steel;
    $("coal").textContent = game.coal;

    $("factories").textContent = game.factories;
    $("shipyards").textContent = game.shipyards;
    $("productionLevel").textContent = game.productionLevel;

    $("ships").textContent = game.ships;
    $("planes").textContent = game.planes;

    $("countryName").textContent = game.selectedCountry;

    $("date").textContent = game.date.toLocaleDateString("de-DE");
}

function log(message) {
    const box = $("log");
    box.innerHTML = message + "<br>" + box.innerHTML;
}

function nextDay() {
    if (game.paused) return;

    game.date.setDate(game.date.getDate() + 1);

    const multiplier = game.productionLevel;

    game.money += game.factories * 100 * multiplier;
    game.steel += game.factories * 2;
    game.coal += game.factories;

    updateUI();
}

function togglePause() {
    game.paused = !game.paused;

    $("pauseButton").textContent =
        game.paused ? "▶ Weiter" : "⏸ Pause";
}

function upgradeFactory() {
    if (game.money < 2000) {
        log("Nicht genügend Geld!");
        return;
    }

    game.money -= 2000;
    game.factories++;

    log("Eine neue Fabrik wurde gebaut!");
    updateUI();
}

function buildShip() {
    if (game.money < 5000 ||
        game.steel < 100 ||
        game.shipyards < 1) {
        log("Ressourcen für den Schiffbau fehlen!");
        return;
    }

    game.money -= 5000;
    game.steel -= 100;
    game.ships++;

    log("Ein neues Schlachtschiff wurde in Auftrag gegeben!");
    updateUI();
}

function buildPlane() {
    if (game.money < 1500 || game.steel < 20) {
        log("Nicht genügend Ressourcen!");
        return;
    }

    game.money -= 1500;
    game.steel -= 20;
    game.planes++;

    log("Ein neues Flugzeug wurde gebaut!");
    updateUI();
}

function airOperation() {
    if (game.planes < 1) {
        log("Du benötigst mindestens ein Flugzeug!");
        return;
    }

    const cost = 100;

    if (game.money < cost) {
        log("Nicht genügend Geld für die Operation!");
        return;
    }

    game.money -= cost;

    // Abstrakter Spieleffekt, keine reale Angriffssimulation.
    log("Luftoperation abgeschlossen. Die gegnerische Wirtschaft erhält einen abstrakten Spielschaden.");

    updateUI();
}

// Weltkarte erstellen
const map = L.map("map", {
    center: [25, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 7
});

L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        noWrap: true
    }
).addTo(map);

const countryStyle = {
    color: "#4e4a3e",
    weight: 0.8,
    fillColor: "#c5b28d",
    fillOpacity: 0.65
};

fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
    .then(response => {
        if (!response.ok) throw new Error("Kartendaten nicht verfügbar");
        return response.json();
    })
    .then(data => {
        const countries = topojson.feature(
            data,
            data.objects.countries
        );

        L.geoJSON(countries, {
            style: countryStyle,

            onEachFeature: (feature, layer) => {
                const name = feature.properties.name || "Unbekannt";

                layer.bindTooltip(name);

                layer.on("click", () => {
                    game.selectedCountry = name;
                    updateUI();

                    log(name + " ausgewählt.");
                });

                layer.on("mouseover", () => {
                    layer.setStyle({
                        fillColor: "#c99c54",
                        fillOpacity: 0.9
                    });
                });

                layer.on("mouseout", () => {
                    layer.setStyle(countryStyle);
                });
            }
        }).addTo(map);
    })
    .catch(error => {
        console.error(error);
        log("Die Weltkarte konnte nicht geladen werden.");
    });

// Spiel startet
updateUI();

// Ein Spieltag alle 2,5 Sekunden
setInterval(nextDay, 2500);
