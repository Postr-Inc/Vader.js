import { Component } from "/dist/vader.js"
 
export class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
           name='button'
            onClick="${this.bind(`console.log(this); this.parentNode.response.redirect(this.props?.redirect); `, false, false, 'n2p7ygclaml', "", null)}", usesEvent="true", eventType="onClick",data-ref="n2p7ygclaml", 
           >${this.props?.children}</button>

        `
    }
}


 //wascompiled