import { Component } from '/vader.js'
 
export class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
           name='button'
            onClick="${this.bind(`console.log(this); this.parentNode.response.redirect(this.props?.redirect); `, false, false, 'v6vbojpfgi', "", null)}", usesEvent="true", eventType="onClick",data-ref="v6vbojpfgi", 
           >${this.props?.children}</button>

        `
    }
}


 //wascompiled