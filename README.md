
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

 
> Do not use any alpha versions as these where changed multiple times any version under latest is considered lts and are deemed to be stable
## Get Started 

2. Install vaderjs

 ```bash
   npm i vaderjs@latest
 ```

4.  Create Proper Folders

Create a pages folder - which allows you to have nextjs page like routing via buns file based router

Tip: Each folder can be deep nested up to 4 levels!

```bash
/pages/index.jsx = /
/pages/home/[page].jsx  = /home/:page
/pages/path/index.jsx = /path/
/pages/test/[...]/index.jsx = /path/test/*
/pages/route/[param1]/[param2].jsx = /path/route/:param1/:param2
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
/pages/path/index.jsx = /path/
/pages/path/[...].jsx = /path/*
 
```
For pages that have [params] you can derive it using this.request
 

# Usage

 
```jsx
// pages/home.jsx
import  {Component, useState, useRef} = from 'vaderjs/client'
import Mycomponent from './src/mycomponent.jsx' 

 
export default function(req, res){
   let counterRef = useRef(null)
   let [count, setCount] = useState(0)

   return <>
    <h1>${count}</h1>
    <button onClick={(count, setCount)=>{setCount(count + 1)}}>
   </>
}
 

 
```

# ServerSide Site Generation (SSG)

Vader compiles all code to a static index.html page so your visitors will never have to wait for the page to load, it then rehydrates the page reapplying functionality!

you can always opt out of ssg using:  

```js
export const $prerender = false;
```
We can define some metadata to be used at compile

```jsx
 // src/layout.tsx
export function Layout({title, keywords, description, children}){
  return <>
   <Html lang="en-us">
        <Head>
            <title>${title}</title>
            <meta charset="utf-8" />
            <meta name="description" content={description} /> 
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Malik Whitten" />
            <meta name="keywords" content={keywords} />
            <meta name="url" content="https://malikwhitten.com" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" href={logo} /> 
            <script src="/src/theme.js" eager> </script>
            <link rel="stylesheet" href="/public/css/styles.css" />
        </Head>

        ${children}
    </Html>
    </>
}

// pages/index.jsx

//$= is a ternary operator used for spread like nesting

export default function (req, res){
  return <>
   <Layout $={{title:'home', description:'home page', keywords:'vader.js', logo:''}}>
   <h1> Hello World</h1>
   </Layout>
  </>
}

```
Vader will take the metadata and place it inside of the compiled html file.
 
### Styling

Vaderjs has two types of in javascript styling - css modules and inline jsx styling
```jsx

// inline
<button style={{color:'red'}}>Button</button>

// css module

//public/app.module.css
`
 .container{
  color:red;
  font-size:20px
 }
`

// import file
import style from 'public/app.module.css' // this gets replaced with the compiled css output

<button style={{...style.container}}>Button </button>

```
### State Management
Vaderjs uses partial hydration & full reflection

You can pass a reference to the dom target like an id for the element u want to change - or you can just swap the value and the entire component will rerender

```jsx
import  {Component, useState, useRef} = from 'vaderjs/client'
 
export default class MyApp extends Component{
  contructor(){
   super()
   this.key = 'static key for state changes'
   // or
   this.nokey // disable element generation 
  }
  
  render(){
    let [count, setCount] = useState(0)
    let ref = useRef('')
   
    return  <>
     <p ref={ref.bind}>Count is ${count}</p>
     ${/**
       pass anything used from the toplevel render to the lowerlevel function params to be able to invoke!
      **/}
     <button onclick={(setCount, count, ref)=>{
      setCount(count + 1, ref.bind)
     }}>Increment</button>
    </>
    
  }
} 
```


### Function Binding

Vaderjs allows you to bind functions directly to html elements just like react
there are two ways - top level invokes like below

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
 
Low level invokes are considered top level and can access - any value above the scope !! 

```jsx
let car = {
  model: 'tesla',
  price: 'toomiuch'
}
return <>
<button onclick={(event)=>{
 console.log(car.model)
}}>Log</button>
```

 

 
 

## License

VaderJS is released under the MIT License. See the [LICENSE](https://github.com/Postr-Inc/Vader.js/blob/main/LICENSE) file for details.

## Join the Community

Connect with the VaderJS community on [GitHub](https://github.com/Postr-Inc/Vader.js). Contribute, share feedback, and improve VaderJS for SPA development. 
 