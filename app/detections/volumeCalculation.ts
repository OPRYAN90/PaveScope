import axios from 'axios';
import { Detection } from './types';

const AVERAGE_POTHOLE_DEPTH = 0.2; // meters

async function getElevation(lat: number, lng: number): Promise<number> {
  try {
    const response = await axios.get(`/api/elevation?lat=${lat}&lng=${lng}`);
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0].elevation;
    } else {
      throw new Error('Invalid elevation data received');
    }
  } catch (error) {
    console.error('Error fetching elevation:', error);
    throw error;
  }
}

export async function calculateVolume(
  selectedDetections: Detection[], 
  phoneHeight: number, 
  imageWidth: number, 
  imageHeight: number,
  horizontalFoV: number,
  verticalFoV: number
) {
  let totalVolume = 0;
  console.log(`Starting volume calculation for ${selectedDetections.length} detections`);
  console.log(`Phone height: ${phoneHeight}m, Image dimensions: ${imageWidth}x${imageHeight} pixels`);
  console.log(`Horizontal FoV: ${horizontalFoV}°, Vertical FoV: ${verticalFoV}°`);

  for (const detection of selectedDetections) {
    console.log(`Processing detection: ${detection.id}`);
    console.log(`GPS coordinates: Lat ${detection.gps.lat}, Lng ${detection.gps.lng}, Alt ${detection.gps.alt}m`);

    try {
      const groundElevation = await getElevation(detection.gps.lat, detection.gps.lng);
      console.log(`Ground elevation: ${groundElevation}m`);

      const cameraHeight = detection.gps.alt - groundElevation;
      console.log(`Calculated camera height: ${cameraHeight}m`);

      // Calculate total image area using provided FoV
      const widthMultiplier = 2 * Math.tan((horizontalFoV / 2) * (Math.PI / 180));
      const heightMultiplier = 2 * Math.tan((verticalFoV / 2) * (Math.PI / 180));
      const totalImageArea = (cameraHeight * widthMultiplier) * (cameraHeight * heightMultiplier);
      console.log(`Total image area: ${totalImageArea.toFixed(2)} sq meters`);

      for (const box of detection.detections) {
        const { xmin, ymin, xmax, ymax } = box.box;
        const boxWidth = xmax - xmin;
        const boxHeight = ymax - ymin;
        console.log(`Detection box dimensions: ${boxWidth}x${boxHeight} pixels`);

        // Calculate fractional area of the detection box
        const fractionalArea = (boxWidth / imageWidth) * (boxHeight / imageHeight);
        console.log(`Fractional area of detection: ${fractionalArea.toFixed(4)}`);

        // Calculate actual area of the detection
        const detectionArea = fractionalArea * totalImageArea;
        console.log(`Actual area of detection: ${detectionArea.toFixed(2)} sq meters`);

        // Calculate volume
        const volume = detectionArea * AVERAGE_POTHOLE_DEPTH;
        console.log(`Calculated volume: ${volume.toFixed(3)} cubic meters`);

        totalVolume += volume;
      }
    } catch (error) {
      console.error(`Error processing detection ${detection.id}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Response:', error.response?.data);
        console.error('Request:', error.request);
      }
    }
  }

  console.log(`Total calculated volume: ${totalVolume.toFixed(3)} cubic meters`);
  return totalVolume;
}
