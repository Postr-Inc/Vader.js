import Vader,{  include, useRef} from "./../../dist/vader/vader.js";
 
export class Home extends Vader.Component {
    constructor() {
        
        super();
        this.cfr = true;
    }
     
     

    async render() {

        
         
        let test = await include('/views/home.html')
         
        return await this.html(test)
    }
    // @ts-ignore
    componentUpdated(prev_state, prev_props, content){
        console.log(prev_state);
    }
    componentDidMount() {
        console.log('mounted');
    }
    
}