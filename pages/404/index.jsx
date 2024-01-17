let {Component, useParams} = await import('./vader.js')

class Index extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
            <h1>
                404 | Not Found
            </h1>

        `
    }
}

return {default: Index}

 //wascompiled