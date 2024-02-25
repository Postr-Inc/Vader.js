window.vader = {
    version: '1.0.0'
}
globalThis.isServer = false
window.hasRan = []
globalThis.memoizedFunctions = []
const memoizedRefs = []
/**
 * @description This function is used to calculate the difference between two nodes - and return the elements in which the difference is found
 * @param {HTMLElement} oldNode 
 * @param {HTMLElement} newNode 
 * @returns 
 */
function calculateDiff(oldNode, newNode){  
    if(oldNode === undefined || newNode === undefined){
        return []
    }
    let diff = [] 
    if(oldNode?.children.length > 0){
        for(var i = 0; i < oldNode.children.length; i++){  
             diff.push(...calculateDiff(oldNode.children[i], newNode.children[i]))
             
        } 
        return diff
    } 
       if(!oldNode?._isRoot){  
        if(oldNode.nodeType === 3 && oldNode.nodeValue !== newNode.nodeValue){
            diff.push({type: 'REPLACE', oldNode, newNode})
        }
        else if(oldNode.nodeType === 1 && oldNode.innerHTML !== newNode.innerHTML
        ){
            diff.push({type: 'REPLACE', oldNode, newNode})
        }
        else if(oldNode.nodeType === 1 && oldNode.tagName === newNode.tagName){
            for(var i = 0; i < oldNode.attributes.length; i++){
                if(oldNode.attributes[i].value !== newNode.attributes[i].value){
                    diff.push({type: 'PROPS', oldNode, newNode})
                }
            }
        }
    } 

     

    return diff
}
 
/**
 *  @description This function is used to generate functonal components
 * @param {Function} tag 
 * @param {Object} props 
 * @param  {...any} children 
 * @returns  {Object} - The first child of the functional component
 */
function generateJSX(tag, props, ...children){ 
   let node = {
     state: {},
     mainFunction: tag,
     _key: tag.name || Math.random().toString(36).substring(7),
     $$typeof: 'JSX_CHILD',
     firstChild:null,
     children: children,
     _name: tag.name,
   } 
   
    node.firstChild = tag() 
    node.firstChild.htmlNode._key =  node._key
    node.firstChild.htmlRoot = node
    node.firstChild.htmlNode._isRoot = true 
    node.firstChild.props = props || {}  
    node.firstChild._isRoot = true
    node.firstChild._key = node._key
    node.firstChild.props['key'] = node._key 
    return  node.firstChild
    

}
function handleStyles(styles, nodeEl) { 

    for (let key in styles) {
        if(typeof styles[key] === 'object'){
            handleStyles(styles[key], nodeEl)
        }
        nodeEl.style[key] = styles[key];
    }
 
}


let hasBeenCalled = []
/**
 * @description Create a virtual DOM element
 * @param {string | Function} tag 
 * @param {Object} props 
 * @param  {...any} children 
 * @returns  {Object} - The virtual DOM element
 */
function Element(tag, props, ...children){
    !props ? props = {} : null
    if(!props?.['$$key']){
        props['$$key'] = tag.name || Math.random().toString(36).substring(7)
    }

    if(typeof tag === 'function'){ 
       return generateJSX(tag, props, children) 
    }
    let node = {
        tag: tag,
        props: props,
        children: children, 
        _key: props['$$key'],
        events: [],
        staticEl: document.createElement(tag),
        parentNode: null
    }
    for(var i = 0; i < children.length; i++){
      if(typeof children[i] === 'string' || typeof children[i] === 'number'){
        children[i] = {
          tag: 'TEXT_ELEMENT',
          props: {nodeValue: children[i]},
          _key: props['$$key'],
          parentNode: {tag: tag, props: props, children: children, _key: props['$$key']},
          children: []
        }
      }else{
          if(children[i]){
            children[i].parentNode = {tag: tag, props: props, children: children}
          }
      }
    }  
    let nodeEl = node.tag === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(node.tag)
    node.staticEl = nodeEl
     
    for(var key in props){ 
       if(key.toLowerCase().startsWith('on')){  
         nodeEl.addEventListener(key.substring(2).toLowerCase(), props[key])
         node.events.push({type: key.substring(2).toLowerCase(), listener: props[key]}) 
         continue
       }  
       if(key === '$$key' && !nodeEl._key && nodeEl.nodeType === 1
       ){
          Object.defineProperty(nodeEl, '_key', {
            value: props[key],
            writable: true
          })
          continue
       }

        if(nodeEl && nodeEl.nodeType === 1){
            nodeEl.setAttribute(key, props[key])
        }
    
    }
    if(props.style){
        handleStyles(props.style, nodeEl)
    }

    if(props.id){
        nodeEl.id = props.id
    }
    if(props.ref){
       switch(true){
        case Array.isArray(props.ref.current):
            if(!props.ref.current.find((el) => el === nodeEl)){
                props.ref.current.push(nodeEl)
            }
            break;
        case props.ref.current === HTMLElement:
            props.ref.current = nodeEl
            break;
        case props.ref.current === null:
            props.ref.current = nodeEl
            break;
        case typeof props.ref === 'function' && !window.hasRan.includes(props.ref):
            window.hasRan.push(props.ref)
            props.ref(nodeEl)
            setTimeout(() => {
                window.hasRan.filter((el) => el !== props.ref)
            }, 0)
            break;
        default:
            props.ref.current = nodeEl
            break;

       }
    }
    node['htmlNode'] = nodeEl
      
      
    if(nodeEl.nodeType === 1){
    for(var i = 0; i < children.length; i++){
      if(children[i]){
        if(children[i].tag === 'TEXT_ELEMENT'){
            nodeEl.appendChild(document.createTextNode(children[i].props.nodeValue))
        } 
        nodeEl.appendChild(Element(children[i].tag, children[i].props, ...children[i].children).htmlNode)
      }
    }
 
}
   
    return node;
}
 

function handleDiff(diff){
    for(var i = 0; i < diff.length; i++){
       switch(true){
              case diff[i].type === 'REPLACE' && !diff[i].oldNode._isRoot:
                let parent = diff[i].oldNode.parentNode  
                diff[i].oldNode.parentNode.replaceChild(diff[i].newNode, diff[i].oldNode)
                break;
              case diff[i].type === 'PROPS': 
                break;
       }
    }

}
let states = {}
export const useState = (name,   initialValue)  => {}
export function useRef(name,  initialValue){
    let ref = initialValue
    if(!memoizedRefs.find((el) => el.name === name)){
        memoizedRefs.push({name, ref})
    }
    let getRef = () =>  memoizedRefs.find((el) => el.name === name).ref 
    let setRef = (newValue) => { 
        memoizedRefs.find((el) => el.name === name).ref = newValue  
    }   
    return  {
        current: getRef(),
        name,
    }
}
export function Mounted(fn, node){ 
    let el = Array.from(document.querySelectorAll('*')).find((el) =>  el._key ===  memoizedFunctions.find((el) => el.mainFunction === node)._key)
    if(el && !hasBeenCalled.find((el) => el === node)){
        fn()
        hasBeenCalled.push(node)
    }
    else{
        setTimeout(() => {
            Mounted(fn, node)
        }, 0)
    }
}
 
 
let effects = []; 

export function  useEffect(fn, deps){ 
    if(!effects.find((el) => el.fn.toString() === fn.toString())){
        effects.push({fn, deps})
    }
    else{
        let effect = effects.find((el) => el.fn.toString() === fn.toString())
        if(effect.deps.toString() !== deps.toString()){
            effect.deps = deps
            effect.fn()
        }
    }
    return () => {
        effects = effects.filter((el) => el.fn !== fn)
    }

}
export function useReducer(name, reducer, vnode, initialState){
    let [state, setState] = useState(name, vnode, initialState)
    let dispatch = (action) => {
        let newState = reducer(state, action)
        setState(newState)
    }

    return  [state, dispatch]

}

class Component {
    constructor(props){
        this.props = props
        this._key = props['$$key'] || Math.random().toString(36).substring(7)
        this.state = {}
        this.htmlNode = null
        this.firstChild = null
        this.Element = Element
        this.effects = []
    }


    setState(newState){
        this.state = newState
    }

    handleDiff(diff){
        for(var i = 0; i < diff.length; i++){
           switch(true){
                  case diff[i].type === 'REPLACE' && !diff[i].oldNode._isRoot:
                    let parent = diff[i].oldNode.parentNode 
                    diff[i].oldNode.parentNode.replaceChild(diff[i].newNode, diff[i].oldNode)
                    break;
                  case diff[i].type === 'PROPS': 
                    break;
           }
        }
    }
    calculateDiff(oldNode, newNode){
        if(oldNode === undefined || newNode === undefined){
            return []
        }
        let diff = [] 
        if(oldNode?.children.length > 0){
            for(var i = 0; i < oldNode.children.length; i++){  
                 diff.push(...this.calculateDiff(oldNode.children[i], newNode.children[i]))
                 
            } 
            return diff
        } 
           if(!oldNode?._isRoot){  
            if(oldNode.nodeType === 3 && oldNode.nodeValue !== newNode.nodeValue){
                diff.push({type: 'REPLACE', oldNode, newNode})
            }
            else if(oldNode.nodeType === 1 && oldNode.innerHTML !== newNode.innerHTML
            ){
                diff.push({type: 'REPLACE', oldNode, newNode})
            }
            else if(oldNode.nodeType === 1 && oldNode.tagName === newNode.tagName){
                for(var i = 0; i < oldNode.attributes.length; i++){
                    if(oldNode.attributes[i].value !== newNode.attributes[i].value){
                        diff.push({type: 'PROPS', oldNode, newNode})
                    }
                }
            }
        } 

         

        return diff
    }
    useEffect(fn, deps){
        if(!this.effects.find((el) => el.fn.toString() === fn.toString())){
            this.effects.push({fn, deps})
        }
        else{
            let effect = this.effects.find((el) => el.fn.toString() === fn.toString())
            if(effect.deps.toString() !== deps.toString()){
                effect.deps = deps
                effect.fn()
            }
        }
        return () => {
            this.effects = this.effects.filter((el) => el.fn !== fn)
        }
    }
    useState(name,   initialValue){
        if(!this.state[name]){
            this.state[name] = initialValue
        } 
        
        let getState = () => this.state[name]
        let setState = (newValue) => { 
            let dEl =  this.firstChild.htmlNode 
            if(dEl.tagName === 'HTML'){
                let firstChild = dEl.querySelector('body').firstChild
                dEl = firstChild
            } 
            this.state[name] = newValue 
            let el = Array.from(document.querySelectorAll('*')).find((el) =>{  
                return el._key === dEl._key
            })  
            let diff = calculateDiff(el, this.render().htmlNode.tagName === 'HTML' ? this.render().htmlNode.querySelector('body').firstChild : this.render().htmlNode) 
            handleDiff(diff)
            
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

    render(){
        return null
    }

}
 
export async function render(vnode, container, ...passProps){  
    
    if(!vnode){
        throw new Error('No vnode was provided')
    }
    // create an object for the node then bind to firstChild 
    let comp = new Component({$$key:  vnode.name || Math.random().toString(36).substring(7)}) 
    vnode = vnode.bind(comp)
    comp.render = () =>   {  
        return vnode(...passProps)
    }
     
    comp.firstChild = comp.render()

    if(comp.firstChild.htmlNode.tagName === 'HTML'){
        let hasHead = comp.firstChild.htmlNode.querySelector('head') ? true : false
        let hasBody = comp.firstChild.htmlNode.querySelector('body') ? true : false
        
        if(hasHead){
             document.head.innerHTML = comp.firstChild.htmlNode.querySelector('head').innerHTML 
             comp.firstChild.children = comp.firstChild.children.filter((el) =>{
                    return el.htmlNode.tagName !== 'HEAD'
             })
        }
        if(hasBody){ 
            comp.firstChild.children = comp.firstChild.children.filter((el) =>{
                if(el.htmlNode.tagName == 'BODY'){
                    comp.firstChild = el.children[0]
                }
            })
        } 
      }
      container.innerHTML = ''
      
      container.appendChild(comp.firstChild.htmlNode)
   
   
}
 
export default Element