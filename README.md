<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# VaderJS: A Reactive Framework for SPAs

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs) 

VaderJS is powerful component based reactive library for spa inspired by react.js


## Get Started

1. Install VaderJS:

```sh
  npm install vaderjs
 ```

or

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/vaderjs@latest/index.js" ></script>
<script type="module" src="https://unpkg.com/vaderjs@latest/index.js">
 ```

2. Import components and utilities into your project.

 - Heres an example import map

 ```html
   <script type="importmap">
        {
            "imports":{
                "vaderjs":"./dist/vader/index.js",
            }
        }
    </script>
 ```

 - Then you can import like this

 ```js
  import Vader, { VaderRouter, include } from 'vaderjs'
  ```

3. Use VaderJS features for routing, state management, auth, and more.

4. Create dynamic SPAs with enhanced user experiences.

5. Type checking / testing
   - Vader has jsdoc annotations built in but also allows ts using the tsconfig
     
  ```bash
   npm run test // validate your code
  ```
## Key Features

### Declarative Routing

```javascript
import VaderRouter from "../dist/vader/vaderRouter.js";
import { Mycomponent} from "../src/pages/Home.js";
 
const app = new VaderRouter('/');

app.get("/", async (req, res)=>{
    res.send('#root', await new Home().render())
})
app.get('/docs/:page/*', async (req, res)=>{
     // page and asterisk route use req.params for params and req.params[0] to get the asterisk
     // you can get queries from the url using req.query!
})
const middleware = (req, res)=>{
    req.time = Date.now()
}
app.use(middleware) // use middlewares

app.listen(3000, ()=>{
    console.log('listening on port 3000')
})
 
```
 

### State Management

```javascript
import Vader from "vaderjs"

class MyApp extends Vader.Component{
  contructor(){
   super()
   
  }
  
  render(){
    const [state, setState] = this.useState('state', 0, ()=>{
     // this is a  callback that is ran on state change!
    })
    
    let myfunc = this.$Function(function fn(){
      setState(state + 1)
    })

    this.useEffect(()=>{
      // this is a callback that is ran on component mount
    }, [])
    
    return this.html(`
     <p>count ${state} </p>
     <button onclick="${myfunc}">Change State by 1</button>
    `)
    
  }
}
```

### Signals

Signals are a way to communicate between components. Signals are similar to events in React.js. Signals are useful for global state management and component communication.

- This is new as of v1.1.2

```javascript

let count = this.signal('count', 0)

let increment = this.$Function(function increment(){
  count.set(count.get() + 1)
})

count.subscribe( (detail)=>{
   console.log(detail)
}, true) // true means it will run on once

// call the signal
count.call()

count.cleanup()  // cleans up the signal

count.get() // returns the signal detail
 


```
- Signals also allow you to share state between scopes

```javascript
window.addEventListener('signalDispatch', (e)=>{
  console.log(e.detail)
})
````

### Function Binding

```javascript

const fn = this.$Function(function fn() {
    console.log("Hello World");
});
 
return html(`<button onclick="${fn}">Click Me</button>`)
```

### Authentication & Authorization

```javascript
const auth = this.useAuth({
    rulesets: rules,
    user: currentUser
});
if (auth.can('edit')) {
    // Display edit button
}
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

## Include views

As of v1.1.0 - Vader allows you to include html files as templates 

```html
// views/app.html

<div>
${
 window.location.hash === "#/home" ? "Home page" : "Not on the Home Page"
}
</div>
```

```js
// home.js
import Vader from "vaderjs";

class Home extends Vader.Component {
  constructor() {
    super();
  }
  render() {
    return this.html(include("views/app.html"));
  }
}

 
```
 

## License

VaderJS is released under the MIT License. See the [LICENSE](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) file for details.

## Join the Community

Connect with the VaderJS community on [GitHub](https://github.com/Postr-Inc/Vader.js). Contribute, share feedback, and improve VaderJS for SPA development.
