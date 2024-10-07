# exif-snap

![exif-snap](https://raw.githubusercontent.com/Maclean-D/pickpair/refs/heads/master/exif-snap.png)

Web application that allows users to upload, modify, and download images while preserving and editing EXIF metadata.

## Features

- Upload multiple images
- View and edit image EXIF metadata
- Rotate images
- Set custom date and time for all images
- Download individual images or all images as a zip file
- Dark mode support
- Responsive design

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
4. **View Metadata**: Click the info button on an image card to view its EXIF metadata.
5. **Download Images**: Click the download button on an image card to download a single image, or use the "Download All" button to download all images as a zip file.
6. **Delete Images**: Use the trash can button to remove an image from the list.
7. **Toggle Dark Mode**: Use the theme toggle button in the top right corner to switch between light and dark modes.

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
