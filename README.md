<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="./logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# Vader.js A reactive framework for building fast and scalable web applications

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs)


# Installation

```js
bun install vaderjs @latest
```

```ts
import { useSate, e } from "vaderjs"
export default function(){
  let [count, setCount] = useState(0)
  return (
    <div>
     <p>Count is {count} </p>
     <button onClick={()=>setCount(count++)}>
      Increment +1
      </button>
    </div>
  )
}
```

# Project Setup 
Create a pages folder - which allows you to have nextjs page like routing via buns file based router

Tip: Each folder can be deep nested up to 4 levels!

```md

/pages/index.jsx = /
/pages/home/[page].jsx  = /home/:page
/pages/path/index.jsx = /path/
/pages/test/[[...catchall]]/index.jsx = /path/test/*
/pages/route/[param1]/[param2].jsx = /path/route/:param1/:param2

```
Keyword folders - all files are passed from these folders to the build folder

```md
1. pages - used for jsx route files
2. src  - used for your jsx components / javascript -typescript files
3. public - used for anything / css / json etc
```


# Define your config

```ts
import { defineConfig } from "vaderjs/config"; 
import cloudflare from "vaderjs/plugins/cloudflare/functions"
import tailwindcss from "vaderjs/plugins/tailwindcss"
export default defineConfig({
    target: "web",
    host: {
        hostname: "localhost",
        provider:'cloudflare' // used for ssg or ssr
    }, 
    env: {
        PORT: 3000,
        SSR: true,
        apiRoute: "https://api.example.com"
    }, 
     Router: {
        tls: {
            cert: "cert.pem",
            key: "key.pem"
        },
        headers: {
            "cache-control": "public, max-age=0, must-revalidate"
        }
    },
    plugins: [cloudflare, tailwindcss],
});

```