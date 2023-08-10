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
const [state, setState] = useState("myState", initialState);
```

### Function Binding

```javascript
registerFunction('login', login);
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
async function myComponent(props){
   return vhtml`
    <div>${props.message}</div>
   `
}

async function app(props){
   let html  = await createComponent(myComponent, {
      message: 'Hello Vader'
   })
   return vhtml `
   <div>
   ${html}
   </div>
   `
}
 
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
