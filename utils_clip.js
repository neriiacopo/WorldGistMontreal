// Import the necessary module from Xenova
import {
    pipeline,
    AutoTokenizer,
    CLIPTextModelWithProjection,
} from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
};

export async function classifyLocations(textEmbeds, data) {
    // Initialize an array to store results
    const results = [];

    // Loop through each location in the data
    for (const loc of data) {
        // Calculate cosine similarity
        const cosineSim = cosineSimilarity(textEmbeds, loc["CLIP_embeddings"]);

        // Store the result along with location details if needed
        results.push({
            location: { X: loc.X, Y: loc.Y },
            pano_id: loc.pano_id,
            similarity: cosineSim,
        });
    }

    return results;
}

export async function getTextEmbeds(text) {
    // Load tokenizer and text model
    const tokenizer = await AutoTokenizer.from_pretrained(
        "Xenova/clip-vit-base-patch32"
    );
    const text_model = await CLIPTextModelWithProjection.from_pretrained(
        "Xenova/clip-vit-base-patch32"
    );

    // Run tokenization
    const text_inputs = tokenizer(text, { padding: true, truncation: true });

    // Compute embeddings
    const { text_embeds } = await text_model(text_inputs);
    const textEmbeddingArray = text_embeds.data;

    const norm = Math.sqrt(
        textEmbeddingArray.reduce((sum, val) => sum + val * val, 0)
    );
    const normalizedTextEmbeds = textEmbeddingArray.map((val) => val / norm);

    return normalizedTextEmbeds;
}
