<p align="center">
  <a href="https://vader-js.pages.dev">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="/icon.jpeg">
      <img src="./logo.png" height="128">
    </picture>
    <h1 align="center">Vader.js</h1>
  </a>
</p>

# VaderJS: A Powerful Reactive Framework for SPAs inspired by react.js!

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/vaderjs.svg?style=flat)](https://www.npmjs.com/package/vaderjs) 

 

## Get Started 

2. Install vaderjs

 ```bash
   npm i vaderjs@latest
 ```

3. Install five server - recommended to watch the index.html file as you edit your code

[Vscode 5 Server](https://marketplace.visualstudio.com/items?itemName=yandeu.five-server)

4.  Create Proper Folders

Create a pages folder - which allows you to have nextjs page like routing via buns file based router

Tip: Each folder can be deep nested up to 4 levels!

```bash
/pages/index.jsx = /
/pages/home/[page].jsx  = /home/:page
/pages/path/index.jsx = /path/file
```
Keyword folders - all files are passed from these folders to the `dist` folder

```bash

pages - used for jsx route files
src  - used for your jsx components / javascript files
public - used for anything 

```

 

5. And your done - Run `npx vaderjs` and the compiled output is visible inside of the `/dist/` folder!


## Key Features & Examples
 
### File based routing
vader's compiler automatically handles routing so you wont need to! - it uses a similar page routing to nextjs

```bash
/pages/index.jsx = /
/pages/home/[page].jsx  = /home/:page
/pages/path/index.jsx = /path/file

 
```
For pages that have [params] you can derive it using this.request
 

### Simplified Component Creation

```jsx
// pages/home.jsx
let {Component, useState} = await import('vaderjs/client') // this will be automatically handled by vader in compile time
let Mycomponent = await require('./pages/mycomponent')
class Home extends Vader {
  constructor() {
    super();
    this.key = '2'
  }
  render() {
    return  <>
      <div key={this.key}>
        <p>Hello World</p>
      </div>
      <Mycomponent ..props />
    </>
  }
}

return {default:Home}
```

 

### State Management

```jsx
let {Component, useState} = await import('vaderjs/client') 

class MyApp extends Component{
  contructor(){
   super()
   this.key = 'static key for state changes'
  }
  
  render(){
    let [count, setCount] = useState(0)
    function increment(){
        setCount(count()+ 1)
    }
    return  <>
     <p>Count is ${count}</p>
     <button onclick={()=>increment()}>Increment</button>
    </>
    
  }
}

return {default:MyApp}
```


### Function Binding

Vaderjs allows you to bind functions directly to html elements just like react

```javascript
// vader uses params[0] as the event target object and other parameters resolve after

function click(event, otherparams){
    console.log(event.target, otherparams)
}

const hello = function(event, otherparams){

}
 
return <>
 <button onclick={()=>click()}>Click Me</button>
</>
```
 
 
 

 

 
 

## License

VaderJS is released under the MIT License. See the [LICENSE](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) file for details.

## Join the Community

Connect with the VaderJS community on [GitHub](https://github.com/Postr-Inc/Vader.js). Contribute, share feedback, and improve VaderJS for SPA development. 
