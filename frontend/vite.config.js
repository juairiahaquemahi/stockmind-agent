import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
<<<<<<< HEAD

=======
 
>>>>>>> 57b7174fa480d04641045edf8ed1053956176b51
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
<<<<<<< HEAD
        target: "https://stockmind-agent.onrender.com",
        changeOrigin: true,
        secure: false,
=======
        target: "http://localhost:3000",
        changeOrigin: true,
>>>>>>> 57b7174fa480d04641045edf8ed1053956176b51
      },
    },
  },
});