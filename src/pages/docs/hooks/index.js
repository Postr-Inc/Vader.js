let {useState, useRef, Component} = await import(Vader.root + '//vader.js')
const data = {
  useState: `
  <div>
    <h1 class='font-bold text-4xl'>
      useState
    </h1>
  </div>
  `,
  useRef: ``,
}
class Hooks extends Component {
    constructor(props){
        super(props)
        console.log(props)
        this.key = 'hooks'
        
    } 
    render(){
        
        return `
         
         ${
          this.props?.page === 'useState' ? data.useState : `
           <div class='flex flex-col gap-5'>
            ${
              this.props?.page === '/docs/hooks/useState' ? data.useState : `
              <h1 class='font-bold text-4xl'>
            Built in Hooks
           </h1>
           <p class="w-[50vw] text-md">
             Hooks in vader are similar to react hooks. They allow you to expand the functionality of your components. You can use inbuilt hooks or create your own custom hooks!
           </p>

           <ul class="list-disc list-inside">
             <li class='list-inside' >
               <a 
               class='text-blue-500 cursor-pointer hover:underline'
               onClick="${this.bind(`this.props?.click('/docs/hooks/useState'); `, false, false, 'btjfb6edb5', "", null)}", usesEvent="true", eventType="onClick",data-ref="btjfb6edb5", >
                  useState
                </a>  
              </li>
           </ul>
              `
            }
         </div>
          `
         }
        `
    }
}

return {Hooks}

 //wascompiled