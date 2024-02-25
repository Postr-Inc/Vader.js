import { Document, Element} from "vaderjs/binaries/Kalix" 
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
export async function renderToString(element, args = []) {   
    let data = typeof element === 'function' ? await element(args) : element
    let doc = new Document()
    let el = doc.createElement(data)
    
    return el.toString()
     
}

/**
 * @description This function is used to generate the server side rendered page
 * @param {Element} element 
 * @param {Object} options 
 * @param {string} options.entry - The entry file for the component (refers to /build/pages/~)
 * @param {Function} options.props - The server side props function 
 * @param {Array} args - The arguments to pass to the props function - ie Request or any other data
 * @param {*} args 
 * @returns 
 */
 
export async function generatePage(element, options =  {entry:"", props: any}, args = []) { 
    let config = await import(process.cwd() + '/vader.config.js').then((config) => { return config.default })
    //@ts-ignore
    globalThis.isServer = true  
    // @ts-ignore  
    let serverSideProps = await options.props({req: args[0], res: args[1]}, args.slice(2))
    let name = element.name 
  
    let comp = new Component(serverSideProps?.props) 
    element = element.bind(comp)
    comp.render = (props)=>  {  
        return element(props)
    } 
    let data = new Document().createElement(comp.render({props: serverSideProps.props, ...args}))
    let document = new Document()
    document.documentElement.setContent(data.querySelector('html') ? data.querySelector('html').innerHTML : '')
    document.documentElement.setAttribute('lang', data.querySelector('html') ? data.querySelector('html').getAttribute('lang') : 'en')
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
    ${
        config?.mode === 'development' ? `
        let ws = new WebSocket('ws://localhost:${env.PORT || 3000}')
        ws.onopen = () => {
             ws.send('Hello')
        }
        ws.onmessage = (e) => {
             if(e.data === 'reload'){
                    window.location.reload() 
             }
        }
        ws.onclose = () => {
            console.log('Connection closed')
            window.location.reload()
        } 
        ` :''
    }
    `)  
    document.body.appendChild(script) 
    return  `<!DOCTYPE html><html lang="${document.documentElement.getAttribute('lang')}">${document.head.toString()}${document.body.innerHTML}</html>`
}

export default renderToString