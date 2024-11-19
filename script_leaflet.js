import { classifyLocations, getTextEmbeds } from "./utils_clip.js";
import { plotResultsN } from "./utils_leaflet.js";

// Load data.json
var geoDB = await fetch("./public/data.json")
    .then((response) => response.json())
    .then((data) => {
        for (const loc of data) {
            loc["CLIP_embeddings"] = new Float32Array(
                loc["CLIP_embeddings"].split(",").map(Number)
            );
        }
        return data;
    });

// Initialize the Leaflet map
var map;
var map = L.map("map")
    .setView([45.505827596084515, -73.57937049924675], 13)
    .fitBounds([
        [45.4673939843934889, -73.6239734105900396],
        [45.5442612077755484, -73.5347675879034739],
    ]);

// Create layer groups for positive and negative results and add them to contorllayers
const posGroup = L.layerGroup().addTo(map);
const negGroup = L.layerGroup().addTo(map);

// Add CartoDB Positron tile layer
L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> contributors',
}).addTo(map);

// Add controlpanel
var controlLayers = L.control.layers().addTo(map);

controlLayers.addOverlay(posGroup, "Positive Results");
controlLayers.addOverlay(negGroup, "Negative Results");

// Function to handle the button click event
function onRunButtonClick() {
    console.log("run sim");

    const inputField = document.getElementById("textInput");
    const inputText = inputField.value;

    console.log("Input text:", inputText);
    if (inputText != "") {
        const textEmbeds = getTextEmbeds(inputText).catch((err) =>
            console.error(err)
        );

        textEmbeds.then((text) => {
            const geoResults = classifyLocations(text, shuffle(geoDB));
            geoResults.then((res) => {
                console.log(res);
                // Clean layers
                posGroup.clearLayers();
                negGroup.clearLayers();

                // Plot the results
                plotResultsN(res, posGroup, negGroup, 500, map);
            });
        });
    } else {
        alert("Please enter an input text to run the analysis");
    }
}

document.getElementById("runBtn").addEventListener("click", onRunButtonClick);

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

document.getElementById("closePanoBtn").addEventListener("click", closePano);

function closePano() {
    document.getElementById("panoViewport").style.display = "none";
}
