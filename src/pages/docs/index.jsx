let {Component, useState, strictMount, useRef} = await import('./vader.js')
class Home extends Component {
    constructor(props){
        super(props)
        this.key = 'index'
    }

    render(){
        
        return `
         
         <div class='flex flex-col gap-5'>
           <h1 class='font-bold text-4xl'>
            Vaderjs Overview
           </h1>
           <p>
             This page provides detailed documentation of various features of vaderjs.
           </p>

           <ul class="list-disc list-inside">
             <li class='list-inside' >
                <a>
                    <span  
                    onClick="${this.bind(`this.response.redirect('/docs/hooks'); `, false, 'him9ot718ce', "", null)}"
                    class="text-blue-500 cursor-pointer hover:underline">Hooks</span> - A powerful way to add reactivity to your components
                </a>
                </li>
           </ul>
         </div>
        `
    }
}

return {Home}

 //wascompiled