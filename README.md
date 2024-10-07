# exif-snap

![exif-snap](https://raw.githubusercontent.com/Maclean-D/pickpair/refs/heads/master/exif-snap.png)

Web application to rotate and change the date of images in bulk. Works great for Camp Snap cameras that don't save date/time or orientation of the camera.

## Features

- Upload multiple images
- View and edit image EXIF metadata
- Rotate images
- Set custom date and time for all images
- Download individual images or all images as a zip file
- Light & Dark mode

## How to Run

1. Open a terminal and clone this repository
   ```
   git clone https://github.com/Maclean-D/exif-snap.git
   ```
   
2. Navigate to the project directory.
   ```
   cd exif-snap
   ```

3. Install dependencies:
   ```
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```   
   
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Upload Images**: Click the "Upload Images" button to select and upload one or more images.
2. **Set Date and Time**: Use the date and time picker to set a custom date and time for all images.
3. **Rotate Images**: Use the rotate buttons on each image card to rotate the image clockwise or counterclockwise.
4. **Download Images**: Click the download button on an image card to download a single image, or use the "Download All" button to download all images as a zip file.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Shadcn/ui
- exifr
- piexifjs
- JSZip
- file-saver
- date-fns
- Lucide React

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Maclean-D/exif-snap&type=Date)](https://star-history.com/#Maclean-D/exif-snap&Date)

## Contributors

<a href="https://github.com/Maclean-D/exif-snap/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Maclean-D/exif-snap" />
</a>
