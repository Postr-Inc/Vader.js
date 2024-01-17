let {Component, useParams} = await import('./vader.js')
 
class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
            onClick="${this.bind(`console.log(this); this.parentNode.response.redirect(this.props?.redirect); `, false, '116gq9t9fu0l', "", null)}",
           >${this.props?.children}</button>

        `
    }
}

return {Button}

 //wascompiled