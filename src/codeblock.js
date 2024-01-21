let {Component, strictMount} = await import('/dist/vader.js')

class CodeBlock extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
        let ref = this.useRef('ref', this.props?.block)
        strictMount(this.key, ()=>{
            console.log('mounted') 
         });
         
        let  blocks = {
            "1": `
             <div>
                let &#123;Component, strictMount&#125; = await import('/dist/vader.js')

             </div>
            `
        }
        console.log(blocks[ref.current])
        return  blocks[ref.current]
    }
}

return {CodeBlock}

 //wascompiled