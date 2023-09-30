import VaderRouter from "../dist/vader/vaderRouter.js";
import { Home } from "../src/pages/Home.js";
import { About } from "../src/pages/About.js";
import { Docs } from "../src/pages/Docs.js";
 
const app = new VaderRouter('/');

app.get("/", async (/** @type {any} */ req, /** @type {{ send: (arg0: string, arg1: string) => void; }} */ res)=>{
    res.send('#root', await new Home().render())
})
app.get('/docs/:page/*', async (/** @type {{ params: any[]; }} */ req, /** @type {{ send: (arg0: string, arg1: string) => void; }} */ res)=>{
    console.log(req)
    // @ts-ignore
    res.send('#root', await new Docs().render(req.params.page, req.params[0]))
})
 
app.listen(3000, ()=>{
    console.log('listening on port 3000')
})