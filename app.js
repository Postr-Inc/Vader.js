

      router.get('/', async (req, res) => {
        res.render(await require('./pages/index.jsx'), req, res)
      }) 
      //@desc /pages/index.jsx
    


      router.get('/Nav', async (req, res) => {
        res.render(await require('./pages/Nav.jsx'), req, res)
      }) 
      //@desc /pages/Nav.jsx
    
