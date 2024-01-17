let {Component, useParams, useRef} = await import('./vader.js')

class Collapse extends Component{
    constructor(props){
        super(props)
        
        this.key = props?.key
    }
    render(){
        let [open, setOpen] = this.useState('open', this.props?.open || false)
         
          
        let collapserEF = this.useRef('collapserEF', null) 
        return  `
             <div
              
             >
                <button class="${this.props?.class}",
                 onClick="${this.bind(`setOpen(!open); this.props?.click(this.props?.redirectTo); `, false, 'dl9e22yma5', "setOpen,open,", setOpen, open)}",>
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

return {Collapse}

 //wascompiled