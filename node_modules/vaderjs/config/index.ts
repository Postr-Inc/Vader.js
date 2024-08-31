type Config = {
  port: number,
  host?: string, 
  plugins?: any[],
  generateTypes?: boolean,
  host_provider?: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'heroku' | 'custom' | 'apache' | 'none',
  host_provider_options?:  {
    [key: string]: any
  },
}

export default function defineConfig(config: Config) {
  return config
}