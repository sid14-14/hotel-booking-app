/** @type {import('tailwindcss').Config} */
export default {
  // these specifies the formats to which tailwindcss will be applied to 
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    container: {
      padding: {
        // overriding default tailwind style:
        //if we define our own custom container, make sure to add responsiveness to it
        //here we making sure our custom padding for screen size applied for screen on med size and up
        md: "10rem",
      },
    },
  },
  plugins: [],
};

// this file created by npx tailwindcss init -p