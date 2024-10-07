declare module 'piexifjs' {
  interface Piexif {
    load: (data: string) => ExifObj;
    dump: (exifObj: ExifObj) => string;
    insert: (exif: string, jpeg: string) => string;
    ImageIFD: Record<string, number>;
    ExifIFD: Record<string, number>;
    GPSIFD: Record<string, number>;
  }

  interface ExifObj {
    '0th'?: Record<number, string | number[]>;
    'Exif'?: Record<number, string | number[]>;
    'GPS'?: Record<number, string | number[]>;
  }

  const piexif: Piexif;
  export = piexif;
}