import VaderRouter from "../dist/vader/vaderRouter.js";
import { Home } from "../src/pages/Home.js";
import { About } from "../src/pages/About.js";
import { Docs } from "../src/pages/Docs.js";
const app = new VaderRouter('/');
app.use('/home')
app.use('/')
app.use('/about')
app.use('/docs')
app.get('/', async (req, res) => {
    console.log(req)
    res.render('#root', await new Home().render());
});
 
app.on('/', async (req, res) => {
    res.render('#root', await new Home().render());
});

app.on('/about', async(req, res)=>{
     res.render('#root', await new About().render());
})
    
app.get('/docs', async(req, res)=>{
        res.render('#root', await new Docs().render('home'));
})
app.on('/docs/:page', async(req, res)=>{
        res.render('#root', await new Docs().render(req.params.page));
})
app.get('/docs/:page', async(req, res)=>{
    res.render('#root', await new Docs().render(req.params.page) )
})
 
app.start();
