export interface GpsCoordinates {
  lat: number;
  lon: number;
}

export interface ExifData {
  // Device
  Make?: string;
  Model?: string;

  // Date & Time
  DateTimeOriginal?: string;
  DateTimeDigitized?: string;
  DateTime?: string;
  
  // Image Dimensions
  PixelXDimension?: number;
  PixelYDimension?: number;

  // Technical
  ISOSpeedRatings?: number;
  FNumber?: number;
  ExposureTime?: number;
  FocalLength?: number;
  Flash?: string;
  Software?: string;

  // GPS
  GPSLatitudeRef?: 'N' | 'S';
  GPSLatitude?: number[];
  GPSLongitudeRef?: 'E' | 'W';
  GPSLongitude?: number[];
  GPSAltitude?: number;

  // Orientation
  Orientation?: number;
}

export interface VulnerabilityIssue {
  type: string;
  description: string;
}

export interface VulnerabilityReport {
  summary: string;
  issues: VulnerabilityIssue[];
}
