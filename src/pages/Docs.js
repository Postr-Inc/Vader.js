import Vader,{ include } from "../../dist/vader/vader.js";

export class Docs extends Vader.Component{
    constructor(){
        super()
    }
    /**
     * @method render
     * @description This method is called when the component is mounted to the DOM.
     * @param {*} props 
     */
    async render(props){
        let [page, setPage] = this.useState('page',  props ? props : 'home');
        
        return this.html(await include(`/views/docs/${page}.html`));
    }
}