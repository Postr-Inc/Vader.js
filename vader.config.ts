import defineConfig from "vaderjs/config";
import tailwindcss from "vaderjs/plugins/tailwindcss"
export default defineConfig({
    port: 3000,
    plugins: [
        tailwindcss(),
    ],
    generateTypes: true,
    host_provider: 'vercel'
})