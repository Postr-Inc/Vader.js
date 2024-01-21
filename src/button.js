import { Component } from "/vader.js"
 
export class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
           name='button'
            onClick="${this.bind(`console.log(this); this.parentNode.response.redirect(this.props?.redirect); `, false, false, 'lmfqp4vsa1n', "", null)}", usesEvent="true", eventType="onClick",data-ref="lmfqp4vsa1n", 
           >${this.props?.children}</button>

        `
    }
}


 //wascompiled