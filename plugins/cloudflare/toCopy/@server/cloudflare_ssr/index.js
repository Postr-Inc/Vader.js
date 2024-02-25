import { Document , Element} from "../Kalix/index.js"
class Component {
    constructor(props){
        this.props = props
        this._key =  Math.random().toString(36).substring(7)
        this.state = {}
        this.htmlNode = null
        this.firstChild = null
        this.Element = Element
    }


    setState(newState){
        this.state = newState
    }

    
    useState(name,   initialValue){
        if(!this.state[name]){
            this.state[name] = initialValue
        } 
        
        let getState = () => this.state[name]
        let setState = (newValue) => { 
           
            
        }  
        return  [getState, setState] 

    }
    useReducer(name, reducer, initialState){
        let [state, setState] = this.useState(name, initialState)
        let dispatch = (action) => {
            let newState = reducer(state(), action) 
            setState(newState)
        }

        return  [state, dispatch]
    }

    useEffect(effect, deps){

    }

    render(){
        return null
    }

}
export async function generatePage(element, options =  {entry:"", props: any}, args = []) {  
    globalThis.isServer = true   
    let serverSideProps = await options.props(...args)
    let name = element.name 
  
    let comp = new Component() 
    element = element.bind(comp)
    comp.render = (props)=>  {  
        return element(props)
    } 
    let data = new Document().createElement(comp.render(serverSideProps))
    let document = new Document()
    document.documentElement.setContent(data.querySelector('html') ? data.querySelector('html').innerHTML : '')
    document.head.setContent(data.querySelector('head') ? data.querySelector('head').innerHTML : '') 
    data.removeChild(data.querySelector('head'))
    let div = new Document().createElement('div')
    div.setAttribute('id', 'app')
    div.setContent(data.innerHTML) 
    document.body.appendChild(div)
    let script = new Document().createElement('script')
    script.setAttribute('type', 'module')   
    script.setContent(script.innerHTML + '\n' + `
    
    import ${name} from "${options?.entry}" 
    import {render} from '/src/client.js'
    import Kuai from '/src/router.js' 
    let kuai = new Kuai({container: document.getElementById('app')})
    kuai.get('/',  (c) => {   
        c.html(render(${name}, document.getElementById('app'), {...c, props: ${JSON.stringify(serverSideProps.props)}}))
    })
   kuai.use('/', () => console.log('Middleware'))
   kuai.listen() 
    `)  
    document.body.appendChild(script) 
    return  `<!DOCTYPE html>${document.head.toString()}${document.body.innerHTML}`
}