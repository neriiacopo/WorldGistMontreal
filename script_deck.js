// Import necessary modules from Kepler.gl
import KeplerGl from "https://unpkg.com/kepler.gl@2.5.5/dist/kepler.gl.min.js";

// Mapbox access token (replace with your own)
mapboxgl.accessToken = "your_mapbox_access_token";

// Create Kepler.gl map container
const mapContainer = document.getElementById("map");
const keplerMap = new KeplerGl({
    id: "kepler-map",
    mapboxApiAccessToken: mapboxgl.accessToken,
    width: "100%",
    height: "100%",
});
mapContainer.appendChild(keplerMap.getRoot());

// Function to plot results using Kepler.gl
function plotResultsKepler(results) {
    const data = {
        version: "1.0",
        dataset: {
            fields: [
                { name: "latitude", type: "real" },
                { name: "longitude", type: "real" },
                { name: "similarity", type: "real" },
            ],
            rows: results.map((loc) => [
                loc.location.Y, // latitude
                loc.location.X, // longitude
                loc.similarity, // similarity
            ]),
        },
    };

    // Add dataset to Kepler.gl
    keplerMap.addData(data);
}

// Modify the classifyImages function to use Kepler.gl for rendering
async function classifyImagesKepler(text, data) {
    // Similar to the Leaflet version, but we pass the results to Kepler.gl
    const tokenizer = await AutoTokenizer.from_pretrained(
        "Xenova/clip-vit-base-patch16"
    );
    const text_model = await CLIPTextModelWithProjection.from_pretrained(
        "Xenova/clip-vit-base-patch16"
    );

    const text_inputs = tokenizer(text, { padding: true, truncation: true });
    const { text_embeds } = await text_model(text_inputs);
    const textEmbeddingArray = text_embeds.data;

    const results = data.map((loc) => {
        const cosineSim = cosineSimilarity(
            textEmbeddingArray,
            loc["CLIP_embeddings"]
        );
        return {
            location: { X: loc.X, Y: loc.Y },
            id: loc.pano_id,
            similarity: cosineSim,
        };
    });

    plotResultsKepler(results);
}

// Handle button click for running the similarity analysis
function onRunButtonClick() {
    const inputField = document.getElementById("textInput");
    const inputText = inputField.value;

    if (inputText !== "") {
        classifyImagesKepler(inputText, db).catch((err) => console.error(err));
    } else {
        alert("Please enter an input text to run the analysis");
    }
}

document.getElementById("runBtn").addEventListener("click", onRunButtonClick);
