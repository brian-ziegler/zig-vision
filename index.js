var autoScanThread;
var checkPokemonThread;
var pokemonRegistry = [];

var pushBulletKey = localStorage.getItem("pushBulletKey");
if (!pushBulletKey) pushBulletKey = "";

var maxNotifyDistance = localStorage.getItem("maxNotifyDistance");
if (!maxNotifyDistance) maxNotifyDistance = "250";

var notifyFilter = localStorage.getItem("notifyFilter");
if (!notifyFilter) notifyFilter = "|";

function z_loadContent() {
    var content = `
        <div id="z_contentContainer">
            <a class="z_toggle autoScan">Auto Scan</a><br>
            <a class="z_toggle notify">Notifications</a><br>
            <a id="openSettings">Settings</a>
        </div>
        <div id="z_settings" title="Settings">
            <p><b>Pushbullet Auth Key:</b><br><input id="pushBulletKey" type="text" value="` + pushBulletKey + `" /></p>
            <p><b>Notification Radius (meters):</b><br><input id="maxNotifyDistance" type="text" value="` + maxNotifyDistance + `" /></p>
            <p><b>Notification Filter:</b><br>
    `;

    for (var i = 1; i <= 151; i++ ) {
        content += `
            <img src="https://ugc.pokevision.com/images/pokemon/` + i + `.png" title="` + App.home.pokedex[i] + `" alt="` + i + `" class="z_filterIcon` + (isFilteredForNotify(i) ? " selected" : "") + `" />
        `;
    }

    content += `
            <p><button id="saveSettings">Save and Close</button></p>
        </div>
        <div id="z_overlay"></div>
    `;

    $("body").append(content);

    $(".z_toggle.autoScan").click(function () {
        $(this).toggleClass("on");
        if ($(this).hasClass("on")) {
            console.log("Starting Auto Scan");
            autoScan();
        } else {
            console.log("Stoping Auto Scan");
            clearTimeout(autoScanThread);
        }
    })

    $(".z_toggle.notify").click(function () {
        $(this).toggleClass("on");
        if ($(this).hasClass("on")) {
            console.log("Starting Notifications");
            checkForUnregisteredPokemon();
        } else {
            console.log("Stoping Notifications");
            clearTimeout(checkPokemonThread);
        }
    })

    $(".z_filterIcon").click(function () {
        var pokemonId = this.alt;
        $(this).toggleClass("selected");
        if ($(this).hasClass("selected")) {
            notifyFilter += pokemonId + "|";
        } else {
            notifyFilter = notifyFilter.replace("|" + pokemonId + "|", "|");
        }
    });

    $("#openSettings").click(function () {
        $("#z_settings").toggleClass("on");
        $("#z_overlay").toggleClass("on");
    });

    $("#saveSettings").click(function () {
        $("#z_settings").toggleClass("on");
        $("#z_overlay").toggleClass("on");
        persistSettings();
    });
}
z_loadContent();

function autoScan() {
    console.log("Scanning...");
    App.home.findNearbyPokemon(App.home.latitude, App.home.longitude, true);
    autoScanThread = setTimeout(autoScan, 31000);
}

function checkForUnregisteredPokemon() {
    console.log("Checking for unregistered pokemon...");
    for(var i in App.home.pokemon) {
        var pokemon = App.home.pokemon[i];
        if (!registryContains(pokemon)) {
            processUnregisteredPokemon(pokemon);
        }
    }
    checkPokemonThread = setTimeout(checkForUnregisteredPokemon, 5000);
}

function registryContains(pokemon) {
    for (var i = 0; i < this.pokemonRegistry.length; i++) {
        var registeredPokemon = this.pokemonRegistry[i];
        if (pokemon.pokemonId === registeredPokemon.pokemonId &&
            pokemon.latitude === registeredPokemon.latitude &&
            pokemon.longitude === registeredPokemon.longitude) {
            return true;
        }
    }
    return false;
}

function processUnregisteredPokemon(pokemon) {
    var distance = calculateDistance(App.home.latitude, pokemon.latitude, App.home.longitude, pokemon.longitude);
    if (distance > maxNotifyDistance) return;

    if (isFilteredForNotify(pokemon.pokemonId)) {
        console.log(pokemon);
        var title = App.home.pokedex[pokemon.pokemonId] + " :: " + formatTime(pokemon.expiration_time * 1000);
        var body = "https://pokevision.com/#/@" + pokemon.latitude + "," + pokemon.longitude;
        sendNotification(title, body);
    }

    pokemonRegistry.push(pokemon);
}

function isFilteredForNotify(pokemonId) {
    if (notifyFilter.indexOf("|" + pokemonId + "|") >= 0) {
        return true;
    } else {
        return false;
    }
}

function sendNotification(title, body) {
    console.log("Sending notification :: " + title + " :: " + body);
    $.ajax({
        url: "https://api.pushbullet.com/v2/pushes",
        type: 'post',
        headers: {
            "Access-Token": pushBulletKey,
            "Content-Type": "application/json"
        },
        data: '{"body":"' + body + '","title":"' + title + '","type":"note"}',
        dataType: 'json',
        success: function(data) {
            console.log("Notify Success");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Notify Error");
        }
    })
}

function formatTime(time) {
    var date = new Date(time);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0'+minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}

function calculateDistance(lat1, lat2, lon1, lon2) {
    var R = 6371e3;
    var deltaLat = (lat2-lat1) * Math.PI / 180;
    var deltaLon = ((lon2-lon1) * Math.PI / 180) * Math.cos((lat2 + lat1) / 2 * Math.PI / 180);
    return R * Math.sqrt((deltaLat * deltaLat) + (deltaLon * deltaLon));
}

function persistSettings() {
    pushBulletKey = $("#pushBulletKey").val();
    localStorage.setItem("pushBulletKey", pushBulletKey);

    maxNotifyDistance = $("#maxNotifyDistance").val();
    localStorage.setItem("maxNotifyDistance", maxNotifyDistance);

    localStorage.setItem("notifyFilter", notifyFilter);
}

