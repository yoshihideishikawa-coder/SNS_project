import exifr from 'exifr';

export interface PhotoData {
  file: File;
  previewUrl: string;
  latitude?: number;
  longitude?: number;
  date?: Date;
  locationName?: string;
}

export async function extractPhotoData(file: File): Promise<PhotoData> {
  let latitude: number | undefined;
  let longitude: number | undefined;
  let date: Date | undefined;

  try {
    const exifData = await exifr.parse(file, ['GPSLatitude', 'GPSLongitude', 'DateTimeOriginal']);
    if (exifData) {
      if (exifData.GPSLatitude && exifData.GPSLongitude) {
        // exifr returns array [lat, lon] sometimes, but usually numbers if requested specifically
        // Ensure we handle the format correctly. exifr generally returns decimal degrees.
        latitude = exifData.GPSLatitude;
        longitude = exifData.GPSLongitude;
      }
      if (exifData.DateTimeOriginal) {
        date = new Date(exifData.DateTimeOriginal);
      }
    }
  } catch (error) {
    console.warn('Failed to extract EXIF data:', error);
  }

  // Fallback to file last modified if EXIF date is missing
  if (!date) {
    date = new Date(file.lastModified);
  }

  return {
    file,
    previewUrl: URL.createObjectURL(file),
    latitude,
    longitude,
    date,
  };
}
