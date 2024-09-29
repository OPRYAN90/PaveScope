import axios from 'axios';

const HUGGINGFACE_ENDPOINT = 'https://e2vww405kc1mzsts.eastus.azure.endpoints.huggingface.cloud';
const HUGGINGFACE_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;

export async function runInference(imageUrl: string) {
  try {
    const response = await axios.post(
      HUGGINGFACE_ENDPOINT,
      { inputs: imageUrl },
      {
        headers: {
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error running inference:', error);
    throw error;
  }
}