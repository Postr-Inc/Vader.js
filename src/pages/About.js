import Vader from "./../../dist/vader/vader.js";

export class About extends Vader.Component{
    constructor(){
        super()
    }
    async render(){
        return this.html(`
        <div className="hero p-5">
        <h1>About</h1>
        </div>
        `)
    }
}