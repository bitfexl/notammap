import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // https://vite.dev/config/server-options
    server: {
        proxy: {
            "/search": {
                target: "http://localhost:7700",
                rewrite: (path) => path.replace("/search", "/indexes/dataIndex/search"),
            },
        },
    },
});
