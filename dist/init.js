import VaderRouter from "vader-router";
import { Home } from "../src/pages/Home.js";
const app = new VaderRouter('/');
app.use('/', async (req, res) => {
    console.log(req)
    res.render('#root', await Home.render());
});
 
app.start ();