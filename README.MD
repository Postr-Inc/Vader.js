<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="https://github.com/Postr-Inc/Vader.js/blob/main/logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# Vader.js  
A modern, reactive framework for building ultra-fast web applications — built on simplicity and speed.

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs)

---

## 🚀 Quick Example

```tsx
import { useState, Switch, Match } from "vaderjs"

export default function() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <Switch>
        <Match when={count > 10}>
          <h1>Count is greater than 10</h1>
        </Match>
        <Match when={count <= 10}>
          <h1>Count is less than or equal to 10</h1>
        </Match>
      </Switch>
    </div>
  )
}
```

---

## 📦 Installation

```bash
bun install vaderjs@latest
```

## ⚙️ Project Structure

Vader.js supports file-based routing out of the box. Just create a `pages` folder like in Next.js:

> ⚠️ Note: This routing system is designed for **production servers** only. It will not work with Cloudflare Pages, GitHub Pages, or Vercel.

You can nest up to 4 levels deep.

```
/pages/index.jsx                         -> /
/pages/home/[page].jsx                   -> /home/:page
/pages/path/index.jsx                    -> /path/
/pages/test/[[...catchall]]/index.jsx    -> /test/*
/pages/route/[param1]/[param2].jsx       -> /route/:param1/:param2
```

---

## 🗂 Keyword Folders

Certain folders are special and automatically picked up by the bundler:

| Folder    | Purpose                             |
| --------- | ----------------------------------- |
| `app/`    | Contains all route `.jsx` files     |
| `src/`    | Your components, utilities, etc.    |
| `public/` | Static files like CSS, JSON, images |

---

## 🛠 Define Config

Create a `config.ts` file at the root of your project:

```ts
import defineConfig from "vaderjs/config";

export default defineConfig({
  port: 3000,
  host: "localhost",
  hot_reload: true,
});
```
 

## 🤔 Why Vader.js?

* Minimal reactivity model with zero VDOM
* File-based routing system built into Bun
* Tiny runtime, blazing fast updates
* Familiar API inspired by React, but simpler
* Perfect for Bun-first, fullstack apps
