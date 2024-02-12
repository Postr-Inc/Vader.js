/**
 * @function defineConfig
 * @description Define the configuration for the application
 * @param {Object} config 
 * @param {Object} config.host -  Important metadata
 * @param {string} config.host.hostname - The hostname for your webapplication
 * @param {Object} config.host.prod - Define data for production use
 * @param {Number} config.host.prod.port - The production port for your webapp
 * @param {('vercel'|'netlify'|'cloudflare')} config.host.provider - Helps vader to generate routes for your webapp
 * @param {Object} config.dev - The development server configuration
 * @param {Number} config.dev.port - The port to use for the development server
 * @param {('localhost')} config.dev.host - The hostname to use for the development server
 * @param {Array} config.integrations - Additional integrations to enhance vaderjs
 * @param {Function} config.integrations[0] - The integration to use for the application
 * @returns {Object} The defined configuration
 */
export const defineConfig = (config = {
    host: {
        provider: '',
        hostname:'',
        prod:{
          port:3000, 
        }
    },
    dev: {
        port: 3000, // Default port for the development server
        host: 'localhost' // Default hostname for the development server
    },
    integrations: []
}) => {
    return config;
};

export default {
    defineConfig
};
