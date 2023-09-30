onmessage = (e)=>{
    let time_started = Date.now()
    let strings =  e.data.strings
    let args =   e.data.args
    let l = e.data.location.split('/#/')[0]
    let result = "";
    for (let i = 0; i < strings.length; i++) {
      result += strings[i];
      if (i < args.length) {
        result += args[i];
      }
    }

    let comments = result.match(/--([^>]*)--/gs)
    if(comments){
        while(comments.length){
            let comment = comments.pop()
            console.log(comment)
            // @ts-ignore
            result = result.replace(comment,'')
        }
    }

    let code =  result.match(/<code([^>]*)>/g)
    if(code){
        while(code.length){
            let c = code.pop()
            // @ts-ignore
            c = c.replace('<code','').replace('>','')
            result = result.replace(`<code${c}>`,`<code${c} style="background:#000;color:#fff;padding:5px;border-radius:5px;font-size:12px;font-weight:bold">`)
        }
    }
 
 
    if(!result.includes('<body>')){
        throw new Error(`Vader Error: You must enclose your html in a body tag for all components. \n\n${result}`)
    }
    /**
     * @type {string[]}
     * @description - grabbing all className attributes and replace them with  class
     */
    // @ts-ignore
     result = result.replace(/classname/g,'class')
         /**
     * @type {string[]}
     * @description - grabbing all image tags and replace the src attribute with the absolute path
     */
    // @ts-ignore
    let images = result.match(/<img([^>]*)>/g)
    for(let i = 0; i < images.length; i++){
      let image = images[i]
      let src = image.match(/src="([^"]*)"/)
      let alt = image.match(/alt="([^"]*)"/)
      if(src){
        if(!src[1].includes('http') || !result.includes('<!-- #vader-disable_relative-paths -->')){
          result = result.replace(src[0],`src="${l}/public/${src[1]}"`)
        }else{
            throw new Error(`Vader Error: You cannot use relative paths in the src attribute of ${src[0]}. Use absolute paths instead. \n\n${src[0]}`)
        }
      }
      if(!alt && !result.includes('<!-- #vader-disable_accessibility -->')){
         throw new Error(`Vader Error: You must include an alt attribute in the image tag  \n\n${image} of class ${e.data.name}. `)
      }
 
      // @ts-ignore
       if(!caches.match(`${l}/public/${src[1]}`)){
        caches.open('vader').then((cache)=>{
            // @ts-ignore
            cache.add(`${l}/public/${src[1]}`)
            // @ts-ignore
            console.log('cached', `${l}/public/${src[1]}`)
           }).catch((err)=>{
             console.log(err)
           })
       }else{
        // @ts-ignore
            console.log('already cached', caches.match(`${l}/public/${src[1]}`))
       }
    }

    let href =  result.match(/href="([^"]*)"/g)
    if(href){
        while(href.length){
            let h = href.pop()
            // @ts-ignore
            h = h.replace('href="','').replace('"','')
            if(!h.includes('http') || !result.includes('<!-- #vader-disable_relative-paths -->')){
               result = result.replace(`href="${h}"`,`href="#${h}"`)
            }else{
                throw new Error(`Vader Error: You cannot use relative paths in ${e.data.file}. Use absolute paths instead. \n\n${h}`)
            }
        }
    }
    
    let time_ended = Date.now()
    let time_taken = time_ended - time_started
    let hasran = false
    if(l.includes('localhost') || l.includes('127.0.0.1') && !hasran){
        hasran = true
        result+= `\$\{console.log('%c${e.data.name} component rendered in ${time_taken}ms','color:#fff;background:#000;padding:5px;border-radius:5px;font-size:12px;font-weight:bold'),""\}`
    }
   
   
    postMessage(`<div data-component=${e.data.name}>${result}</div>`)
   
  }
