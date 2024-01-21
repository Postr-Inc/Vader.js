let { Component } = await import(Vader.root + '//vader.js')
 
export class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
           name='button'
            onClick="${this.bind(`console.log(this); this.parentNode.response.redirect(this.props?.redirect); `, false, false, 'm7xtffjzn6m', "", null)}", usesEvent="true", eventType="onClick",data-ref="m7xtffjzn6m", 
           >${this.props?.children}</button>

        `
    }
}


 //wascompiled