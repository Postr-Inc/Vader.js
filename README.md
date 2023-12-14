<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# VaderJS: A Reactive Framework built for speed

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs) 

VaderJS is powerful component based  library inspired by react.js and nextjs


## Get Started With SSR
1. Ensure you have bunjs installed and configured
   Vader leverages bun's speed for both compiling and websocket hydration ensure you have properly set up bun before continuing.
   [Quick Start](https://bun.sh/docs/quickstart)

2. Install VaderJS:

```sh
 bun add vaderjs
 ```

3.  vader.config.ts
This is used to tell vader routes to pages you want but also configurations to improve dev experience.

```ts
module.exports = {
  dev: true, // log to console
  persistState:  false, // clear or not to clear
  noCache: false, // this is recommended to be true, but in case you want to see changes
 // directly each refresh then you an set it to false.
  port: {
    stream: 3000,
    client: 3001,
  },
   // When user visits route the page for that route will be sent if configured here
  routes: {
    "/": "/pages/index.ts",
  }, 
};
```
 

5. Folder setup

Ensure your project base dir has both src directory and public directly, these are used to serve files for the client.

 

 4. Using Vader.Component
 - Then you can import like this

 ```js
  import Vader from 'vaderjs'
  class Home extends Vader.Component{
}
  ```
 

#  Key Features

### SSR Rendering

Vaderjs is ssr first 

```ts
import Vader from "vaderjs";
class Home extends Vader.Component {
  constructor(ws: Websocket) {
    super(ws: Websocet);
     
  }
  async render() {
    // this is 
    return this.html(`<div>Hello World</div>`);
  }
  componentDidMount(){
   // gets ran when the client has reported a remount or mount
  }
}
```

 
### State Management

```javascript
import Vader from "vaderjs"

class MyApp extends Vader.Component{
  contructor(){
   super()
   
  }
  
  render(){
    const [state, setState] = this.useState('state', 0)
    
     this.fn(function increment(){
      setState(state + 1)
    })

     
    return this.html(`
     <p>count ${state} </p>
     <button ref="btn" onclick="request('click', 'btn', 'invoke', {fn:'increment', args:{ }})">Change State by 1</button>
    `)
    
  }
}
```

### Signals

Signals are a way to communicate between components. Signals are similar to events in React.js. Signals are useful for global state management and component communication.

- This is new as of v1.1.2

```javascript

let count = this.signal(0, 'count')

 this.fn(function increment(){
  count.set(count.value + 1)
})

count.subscribe( (detail)=>{
   console.log(detail)
})  

```

### Function Binding

```javascript

this.fn(function fn() {
    console.log("Hello World");
});
 
return html(`<button  ref="btn" onclick="request('click', 'btn', 'invoke', {fn:'increment', args:{ }})">Click Me</button>`)
```
 

 
### Simplified Component Creation

```javascript
import Vader from 'vaderjs';

export class App extends Vader.Component{
  constructor(){
    super('App')
  }
  render(){
    return html`<div>Hello World</div>`
  }
}
```

 
 

## License

VaderJS is released under the MIT License. See the [LICENSE](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) file for details.

## Join the Community

Connect with the VaderJS community on [GitHub](https://github.com/Postr-Inc/Vader.js). Contribute, share feedback, and improve VaderJS for SPA development.
