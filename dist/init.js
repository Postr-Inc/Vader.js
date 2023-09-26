import VaderRouter from "../dist/vader/vaderRouter.js";
import { Home } from "../src/pages/Home.js";
import { About } from "../src/pages/About.js";
 
const app = new VaderRouter('/');
app.use('/home')
app.use('/')
app.use('/about')
app.get('/', async (req, res) => {
    console.log(req)
    res.render('#root', await new Home().render());
});
 
app.on('/', async (req, res) => {
    res.render('#root', await new Home().render());
});

app.on('/about', async(req, res)=>{
     res.render('#root', await new About().render());
     await new Home().unmount();
})
     
 
app.start();
