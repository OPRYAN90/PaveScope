import axios from 'axios';

const HUGGINGFACE_ENDPOINT = process.env.NEXT_PUBLIC_HUGGINGFACE_ENDPOINT;
const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function runInference(imageBlob: Blob, maxRetries = 3) {
  if (!HUGGINGFACE_ENDPOINT || !HUGGINGFACE_API_KEY) {
    throw new Error('Hugging Face API credentials are not set in the environment variables.');
  }

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
        if (attempt < maxRetries) {
          const delayTime = attempt === 1 ? 2000 : 25000;
          console.log(`Attempt ${attempt} failed. Retrying in ${delayTime / 1000} seconds...`);
          await delay(delayTime);
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
