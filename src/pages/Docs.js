import Vader,{ include } from "../../dist/vader/vader.js";

export class Docs extends Vader.Component{
    constructor(){
        super()
    }
 
    async render(p, asterisk){
        const page = asterisk ? `${p}/${asterisk}` : p;
      
        return this.html(await include(`/views/docs/${page}.html`))
    }
}