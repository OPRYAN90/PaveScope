export interface Detection {
  id: string;
  imageUrl: string;
  fileName: string;
  gps: {
    lat: number;
    lng: number;
    alt: number;
  };
  detections: {
    box: {
      xmin: number;
      ymin: number;
      xmax: number;
      ymax: number;
    };
    score: number;
  }[];
  timestamp: any;
}
