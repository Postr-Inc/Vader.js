let {Component, useParams} = await await import(Vader.root + '//vader.js')

class Index extends Component{
    constructor(props){
        super(props)
         
    }
    render(){ 
         
         
        return  `
            <h1 class="mx-auto text-2xl align-middle w-screen h-screen hero">
                404 | Not Found
            </h1>

        `
    }
}

 
export default Index

 //wascompiled