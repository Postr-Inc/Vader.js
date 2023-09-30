import Vader,{  include, useRef} from "./../../dist/vader/vader.js";
 
export class Home extends Vader.Component {
    constructor() {
        
        super();
        this.cfr = true
    }
     
     

    async render() {

        let counter = this.signal('count', 0)
 

        
         
         
        let e = this.$Function((e)=>{
            counter.set(counter.get() + 1);
             
        })
         
        let test = await include('/views/home.html')
         
        return await this.html(test)
    }
    componentUpdated(prev_state, prev_props, content){
        console.log(prev_state);
    }
    componentDidMount() {
        console.log('mounted');
    }
    
}