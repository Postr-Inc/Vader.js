# VaderJS: A Reactive Framework for SPAs

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs) 

VaderJS is a powerful reactive framework for building Single-Page Applications (SPAs), inspired by React.js.

## Key Features

### Declarative Routing

```javascript
const router = new vaderRouter('/');
router.use('/');
router.on('/test/:hello', (req) => {
    console.log(req.params);
});
router.start();
```

### State Management

```javascript
const [state, setState] = useState("count", initialState);
function increment(){
   setState(state + 1)
}
rf('increment', increment)
useEffect((state)=>{
  console.log('New State for count' + state)
}[state])
<button onclick="increment()">Increment</button>
```

### Function Binding

```javascript
rf('login', login);
return html`<button onclick="login()">Login</button>`;
```

### Authentication & Authorization

```javascript
const auth = useAuth({
    rulesets: rules,
    user: currentUser
});
if (auth.can('edit')) {
    // Display edit button
}
```

### Global State Management

```javascript
const store = createStore(initialState);
const { state, setState, subscribe } = store;
```

### Simplified Component Creation

```javascript
// id is a unique component key in which allows vader to update the component state!
const myComponent = (id) = component(id, {
 render: (states, props) => {
   return vhtml`
    <div>${props.message}</div>
   `
}
})

 // then call

myComponent(key).render({props})

//example

import VaderRouter from "./router.js";
import { vhtml, component, rf } from './script.js'

const app = component('app', {
  render: (states) => {
    let [count, setCount] = useState('count', 0);
    useEffect(() => {
      console.log(states)
      console.log('App component mounted');
    }, [count]);

    function incrementHandler() {
      setCount(count + 1);
    }
    rf('incrementHandler', incrementHandler);


    return vhtml`
     
      <div>
        <button className="btn" onclick="incrementHandler()"
        
        >Count: ${count}</button>
        ${
          count > 10 ? '<h1 style="color:lightBlue">Greater Than 10</h1>' : 'Less than 10'
        }
      </div>
    `;
  },
})

document.body.innerHTML = app.render()
```

## Get Started

1. Install VaderJS:
   ```sh
   npm install vaderjs
   ```

2. Import components and utilities into your project.

3. Use VaderJS features for routing, state management, auth, and more.

4. Create dynamic SPAs with enhanced user experiences.

## License

VaderJS is released under the MIT License. See the [LICENSE](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) file for details.

## Join the Community

Connect with the VaderJS community on [GitHub](https://github.com/Postr-Inc/Vader.js). Contribute, share feedback, and improve VaderJS for SPA development.
