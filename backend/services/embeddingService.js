let pipeline;

/**
 * Lazy load the @xenova/transformers library and initialize the embedding pipeline.
 * This ensures the model is loaded only once (singleton pattern) and not on every request.
 */
const initEmbeddingService = async () => {
    if (!pipeline) {
        try {
            // Dynamically import to ensure it works properly in both CJS and ESM environments
            const transformers = await import('@xenova/transformers');

            // Initialize the pipeline with a multilingual model
            pipeline = await transformers.pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
            console.log('Local embedding model (paraphrase-multilingual-MiniLM-L12-v2) loaded successfully.');
        } catch (error) {
            console.error('Failed to initialize local embedding model:', error);
            throw new Error('Failed to load local embedding model');
        }
    }
    return pipeline;
};

/**
 * Generate an embedding vector for a given text
 * using the local Xenova/paraphrase-multilingual-MiniLM-L12-v2 model.
 *
 * @param {string} text - The input text to embed
 * @returns {Array<number>} The normalized embedding vector
 */
const getEmbedding = async (text) => {
    try {
        const extractor = await initEmbeddingService();

        // Generate embedding. The model returns a tensor, we request pooling and normalization.
        const output = await extractor(text, { pooling: 'mean', normalize: true });

        // Convert the tensor output to a standard JavaScript array
        return Array.from(output.data);
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw new Error('Failed to generate local AI embedding');
    }
};

module.exports = {
    getEmbedding,
    initEmbeddingService
};
