/**
 * @description Instruct the compiler to use the provided configuration
 * @typedef {Object} Config
 * @property {string} target - The target environment
 * @property {Object} host - The host object
 * @property {string} host.hostname - The hostname of the application
 * @property {string} host.provider - The provider of the application
 * @property {Object} compilerOptions - The compiler options
 * @property {string} compilerOptions.outDir - The output directory
 * @property {string} compilerOptions.target - The target of the compiler
 * @property {any[]} plugins - The plugins to be used in the application
 * @property {string} mode - The mode of the application
 * @param config  - The configuration object 
 * @returns 
 */
/**
 * Defines the configuration options for VaderJS.
 * @param {Object} config - The configuration object.
 * @param {string} config.target - The target platform for the code ('web' or 'bun').
 * @param {Object} [config.host] - The host configuration.
 * @param {string} [config.host.hostname] - The hostname for the host.
 * @param {('vercel','netlify')} [config.host.provider] - The provider for the host ('vercel', 'netlify', 'aws', 'azure', 'gcp').
 * @param {number} [config.host.port] - The port number for the host.
 * @param {Object} [config.compilerOptions] - The compiler options.
 * @param {string} [config.compilerOptions.outDir] - The output directory for the compiled code.
 * @param {string} [config.mode] - The mode for the configuration.
 * @param {Array} [config.plugins] - The plugins for the configuration.
 * @param {Object} [config.env] - The environment variables for the configuration.
 * @returns {Object} The configured object.
 */
export const defineConfig = (config: { 
    /**
     * @type {string}
     * @param {('web'|'bun')} target
     */
    target:string,
    host?: {
        hostname?: string,
        /**
         * @param {('vercel', 'netlify', 'aws', 'azure', 'gcp')} provider
         */
        provider?: string,
        port?: number
    },
    compilerOptions?: {
        outDir?: string, 
    },
    mode?: string,
    plugins?: any[]
    env?: {
        [key: string]: any
    }
}) => {
    // add config.env to globalThis.env
    let env = {}
    if(config.env){
        for(let key in config.env){
            env[key] = config.env[key]
        }
        for(let key in globalThis.env){
            env[key] = globalThis.env[key]
        }
    }

    //@ts-ignore
    globalThis.env = env
    return config
}