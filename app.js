
      router.get('/', async (req, res) => {
        res.render(await import('./pages/index.js'), req, res)
      }) 
      //@desc /pages/index.jsx
    

      router.get('/docs', async (req, res) => {
        res.render(await import('./pages/docs/index.js'), req, res)
      }) 
      //@desc /pages/docs/index.jsx
    

      router.get('/404', async (req, res) => {
        res.render(await import('./pages/404/index.js'), req, res)
      }) 
      //@desc /pages/404/index.jsx
    
