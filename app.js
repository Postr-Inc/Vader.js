
      router.get('/', async (req, res) => {
        res.render(await require('./pages/index.jsx'), req, res)
      }) 
      //@desc /pages/index.jsx
    

      router.get('/404/', async (req, res) => {
        res.render(await require('./pages/404/index.jsx'), req, res)
      }) 
      //@desc /pages/404/index.jsx
    

      router.get('/docs/:page', async (req, res) => {
        res.render(await require('./pages/docs/[page].jsx'), req, res)
      }) 
      //@desc /pages/docs/[page].jsx
    
