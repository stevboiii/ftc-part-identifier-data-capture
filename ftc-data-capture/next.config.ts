/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Tells Next.js to compile into static HTML/CSS/JS
  images: {
    unoptimized: true, // Required for static exports
  },
  // Replace 'YOUR_REPOSITORY_NAME' with your actual GitHub repository name
  basePath: '/ftc-part-identifier-data-capture', 
};

export default nextConfig;
