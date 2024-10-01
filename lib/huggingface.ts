import axios from 'axios';

const HUGGINGFACE_ENDPOINT = 'https://e2vww405kc1mzsts.eastus.azure.endpoints.huggingface.cloud';
const HUGGINGFACE_API_KEY = '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';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runInference(imageBlob: Blob, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log('Image content type:', imageBlob.type);

      const response = await axios.post(
        HUGGINGFACE_ENDPOINT,
        imageBlob,
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': imageBlob.type,
            'Accept': 'application/json'
          },
          responseType: 'json'
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 503 && attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed. Retrying in ${attempt * 2} seconds...`);
          await delay(attempt * 2000);
          continue;
        }
        console.error('Axios error:', error.response?.status, error.response?.data);
        throw new Error(`Inference failed: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      } else {
        console.error('Unexpected error:', error);
        throw new Error('An unexpected error occurred during inference');
      }
    }
  }
  throw new Error('Max retries reached. Service is unavailable.');
}