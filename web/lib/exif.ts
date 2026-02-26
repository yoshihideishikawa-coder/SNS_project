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
    const [gps, exifData] = await Promise.all([
      exifr.gps(file).catch(() => null),
      exifr.parse(file, ['DateTimeOriginal']).catch(() => null),
    ]);

    if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
      latitude = gps.latitude;
      longitude = gps.longitude;
    }

    if (exifData?.DateTimeOriginal) {
      date = new Date(exifData.DateTimeOriginal);
    }
  } catch (error) {
    console.warn('Failed to extract EXIF data:', error);
  }

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
