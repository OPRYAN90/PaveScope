# PaveScope: Revolutionizing Road Surveying and Infrastructure Assessment

PaveScope is an advanced, full-stack application designed to transform road surveying and infrastructure management through the integration of drone imagery, machine learning (ML), and real-time geolocation technology. This project aims to automate road condition analysis and volume estimation, providing a cost-efficient, time-saving alternative to traditional road surveying methods.

## Overview

PaveScope leverages the following technologies:
- **UAVs (Unmanned Aerial Vehicles)**: For road surveying and image capture.
- **YOLOv8**: A state-of-the-art machine learning model for detecting road damage (potholes, cracks, metal erosion).
- **Google Maps Elevation API**: For accurate volumetric and cost measurements.
- **Firebase**: Used for user authentication and data storage.
- **Google Maps API**: Integrated for real-time geolocation mapping of road damage.

By merging these technological layers into a cohesive platform, PaveScope provides a solution for automated road surveying without traffic disruptions while offering precise, data-driven insights for infrastructure maintenance.

## Features

- **Drone-Captured Imagery**: Automatically processes UAV-captured road images.
- **Road Damage Detection**: Detects potholes, cracks, and other damages using a fine-tuned YOLOv8 model.
- **Volume and Cost Estimation**: Estimates the volume of road damage and calculates the repair costs using geospatial data.
- **Real-Time Mapping**: Uses the Google Maps API to map detected damage and provides geolocation data.
- **User-Friendly Interface**: Built using modern UI/UX practices with React.js and Next.js.
- **API Integration**: Syncs geolocation and image data with Google Maps API and Google Maps Elevation API.
- **Data Export**: Generates and exports road condition data in CSV format for further analysis.

## Technical Architecture

### Machine Learning - YOLOv8
The heart of damage detection in PaveScope is powered by the YOLOv8 model, which excels at real-time object detection. It has been fine-tuned to detect road issues such as potholes and cracks from drone-captured imagery. YOLOv8 uses an anchor-free approach and the CSPDarknet53 backbone for feature extraction.

### Volume Calculation
1. **Camera Height**: Uses GPS data to calculate the camera's height above the ground.
2. **Ground Area**: Uses field of view (FOV) angles to calculate the area visible in each image.
3. **Pothole Area**: Calculates the real-world size of detected potholes using image resolution and bounding box data.
4. **Volume and Cost**: Computes the volume of detected potholes and estimates repair costs based on material prices.

### Full-Stack Implementation
- **Frontend**: Built using React.js and ShadCN UI for a clean and modern interface.
- **Backend**: Integrated with Firebase for real-time data storage and authentication.
- **Next.js**: Provides server-side rendering and API route management for efficient data handling.
- **Deployment**: Deployed on Vercel for optimized performance and scalability.

## Usage

### Upload Images
Users can upload drone-captured images or videos of road surfaces to the platform. The images are processed by the YOLOv8 model, which detects road damage, maps it to a geolocation, and provides a cost estimate for repair.

### Data Export
After analysis, users can export the detected data, including pothole locations and severity, as a CSV file, making it easy to share with road maintenance teams.

## Deployment

PaveScope is deployed and available at:  
[**pave-scope.vercel.app**](https://pave-scope.vercel.app)

You can visit the deployed application, create an account, upload sample data, and explore the road condition detection and analysis features.  
The project is also available on GitHub:  
[**github.com/OPRYAN90/PaveScope**](https://github.com/OPRYAN90/PaveScope)

## Contributing

We welcome contributions! Feel free to open an issue or submit a pull request. Whether you're improving documentation, adding new features, or fixing bugs, your help is greatly appreciated.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
