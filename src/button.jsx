let {Component, useParams} = await import('./vader.js')
 
class Button extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
           <button class="${this.props?.class}",
            onClick="${this.bind(`this.parentNode.response.redirect(this.props?.redirect); `, false, 'nz450qw707g', "", null)}"
           >${this.props?.children}</button>

        `
    }
}

return {Button}

 //wascompiled