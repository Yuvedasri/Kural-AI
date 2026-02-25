const { getEmbedding } = require('./embeddingService');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

// Define category seeds for semantic comparison
const categorySeeds = {
    Healthcare: "doctor hospital emergency patient ambulance medicine",
    Education: "school teacher classroom student exam building bench",
    Water: "water supply leakage tank drinking water",
    Electricity: "power cut transformer electricity short circuit",
    Roads: "road pothole accident bridge repair",
    Sanitation: "garbage waste drainage toilet cleaning"
};

// Start with empty in-memory cache
let categoryEmbeddings = null;

/**
 * Initialize category embeddings. This should be called once when the server starts.
 * It pre-computes the vectors for all categories so subsequent incoming complaints
 * don't have to wait for the model to embed seed texts.
 */
const initCategoryEmbeddings = async () => {
    try {
        console.log('Initializing category embeddings...');
        const cache = {};

        // Generate an embedding for each seed category text once
        for (const [category, seedText] of Object.entries(categorySeeds)) {
            cache[category] = await getEmbedding(seedText);
        }

        categoryEmbeddings = cache;
        console.log('Category embeddings initialized successfully');
    } catch (error) {
        console.error('Failed to initialize category embeddings:', error);
    }
};

/**
 * Compare a given complaint vector to the pre-computed category embeddings
 * and return the highest matching category and its score.
 *
 * @param {Array<number>} textEmbedding - the embedding vector of the new complaint
 * @returns {Object} An object containing the highest matching { category, similarityScore }
 */
const classifyComplaint = (textEmbedding) => {
    if (!categoryEmbeddings) {
        throw new Error('Category embeddings are not initialized yet.');
    }

    let bestCategory = 'General';
    let highestSimilarityScore = -1;
    const similarityBreakdown = {};

    // Use cosine similarity to compare against all category seeds
    // This provides transparency into the classification model (Explainable AI)
    for (const [categoryName, categoryVector] of Object.entries(categoryEmbeddings)) {
        const similarity = cosineSimilarity(textEmbedding, categoryVector);

        // Store score in breakdown, rounded for readability
        similarityBreakdown[categoryName] = parseFloat(similarity.toFixed(3));

        if (similarity > highestSimilarityScore) {
            highestSimilarityScore = similarity;
            bestCategory = categoryName;
        }
    }

    // Return the detailed breakdown along with the best score and category
    return {
        bestCategory: bestCategory,
        bestScore: highestSimilarityScore,
        similarityBreakdown
    };
};

module.exports = {
    initCategoryEmbeddings,
    classifyComplaint
};
