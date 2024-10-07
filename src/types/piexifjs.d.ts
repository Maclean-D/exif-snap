declare module 'piexifjs' {
  export const piexif: {
    load: (data: string) => any;
    dump: (data: any) => any;
    insert: (exif: any, jpeg: string) => string;
    ImageIFD: { [key: string]: number };
    ExifIFD: { [key: string]: number };
    GPSIFD: { [key: string]: number };
  };
}