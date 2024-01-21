import { Component, useState } from "/vader.js"

export class Collapse extends Component{
    constructor(props){
        super(props)
        
        this.key = props?.key
    }
    render(){
        let [/** @type {Boolean} */open, setOpen] = this.useState('open', this.props?.open || false)
         
          
        let collapserEF = this.useRef('collapserEF', null) 
        return  `
             <div
              
             >
                <button class="${this.props?.class}",
                 onClick="${this.bind(`setOpen(!open); this.props?.click(this.props?.redirectTo); `, false, false, '60jnfrlriyj', "setOpen,open,", setOpen, open)}", usesEvent="true", eventType="onClick",data-ref="60jnfrlriyj", >
                    ${this.props?.title}
                 </button>
                <div 
                ref="${collapserEF.bind}",
                class="${`${open ? 'visible' : 'hidden'}`}",>
                    ${this.props?.children}
                </div>
             </div>
        `
    }
}
 

 //wascompiled