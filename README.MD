<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="https://github.com/Postr-Inc/Vader.js/blob/main/logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# Vader.js A reactive framework for building fast and scalable web applications

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs)

```tsx
import { useState, Switch, Match } from "vaderjs"

export default function(){
  let [count, setCount] = useState(0)
  return(
    <div>
     <Switch>
      <Match when={count() > 10}>
           <h1>Count is greater than 10 </h1>
      </Match>
      <Match when={count() < 10}>
       <h1>Count is less than 10 </h1>
      </Match>
     </Switch>
   </div>
  )
}
```
# Installation

```js
bun install vaderjs @latest
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
1. app - used for jsx route files 
2. public - used for anything / css / json etc
3. Src - components utilities etc
```


# Define your config

```ts
import defineConfig from "vaderjs/config";

export default defineConfig({
    port: 3000,
    host: 'localhost', 
    hot_reload: true,
})

```
