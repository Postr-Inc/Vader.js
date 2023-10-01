 
onmessage = (e)=>{
    let time_started = Date.now()
    let strings =  e.data.strings
    let args =   e.data.args
    let js = ''
    let l =  e.data.location.split('/').slice(0,-1).join('/')
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

  
    // Convert headings (e.g., #1-6 Heading => <h1-6>Heading</h1-6>)
    // @ts-ignore
      result = result.replace(/(#+)(.*)/g, (match, hashes, text) => {
        console.log(match)
        if(!match.includes('<') || !match.includes('>')){ 
          let level = hashes.length;
            return `<h ${level} class="markdown_heading">${text}</h${level}>`;
        }else{
            return match
        }
      });
  
    
      // Convert bold (e.g., **Bold** => <b>Bold</b>)
      result = result.replace(/\*\*(.*?)\*\*/g, (match, text) => {
        return `<b class="markdown_bold">${text}</b>`;
      });
    
      // Convert italic (e.g., *Italic* => <i>Italic</i>)
      result = result.replace(/\*(.*?)\*/g, (match, text) => {
        return `<i class="markdown_italic">${text}</i>`;
      });
    
      // Convert code (e.g., `code` => <code>code</code>)
      result = result.replace(/`(.*?)`/g, (match, text) => {
        return `<code>${text}</code>`;
      });
    
      // Convert links (e.g., [Text](URL) => <a href="URL">Text</a>)
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        return `<a  class="markdown_link" href="${url}">${text}</a>`;
      });
    
      // Convert images (e.g., ![Alt](URL) => <img src="URL" alt="Alt" />)
      result = result.replace(/!\[([^\]]+)\]\(([^)]+)\)/g, (match, alt, src) => {
        return `<img  class="markdown_image" src="${src}" alt="${alt}" />`;
      });
    
      // Convert unordered lists (e.g., * Item => <ul><li>Item</li></ul>)
      result.split('\n').forEach((line, index, arr) => {
        if (line.match(/^\s*-\s+(.*?)$/gm)) {
          if (index === 0 || !arr[index - 1].match(/^\s*-\s+(.*?)$/gm)) {
            result = result.replace(line, `<ul class="markdown_unordered" style="list-style-type:disc;list-style:inside"><li>${line.replace(/^\s*-\s+(.*?)$/gm, '$1')}</li>`);
          } else if (index === arr.length - 1 || !arr[index + 1].match(/^\s*-\s+(.*?)$/gm)) {
            result = result.replace(line, `<li>${line.replace(/^\s*-\s+(.*?)$/gm, '$1')}</li></ul>`);
          } else {
            result = result.replace(line, `<li>${line.replace(/^\s*-\s+(.*?)$/gm, '$1')}</li>`);
          }
        }
      });
 
      // Convert ordered lists (e.g., 1. Item => <ol><li>Item</li></ol>) in order
    
       result.split('\n').forEach((line, index, arr) => {
        if (line.match(/^\s*\d+\.\s+(.*?)$/gm)) {
          if (index === 0 || !arr[index - 1].match(/^\s*\d+\.\s+(.*?)$/gm)) {
            result = result.replace(line, `<ol class="markdown_ordered" style="list-style-type:decimal;"><li>${line.replace(/^\s*\d+\.\s+(.*?)$/gm, '$1')}</li>`);
          } else if (index === arr.length - 1 || !arr[index + 1].match(/^\s*\d+\.\s+(.*?)$/gm)) {
            result = result.replace(line, `<li>${line.replace(/^\s*\d+\.\s+(.*?)$/gm, '$1')}</li></ol>`);
          } else {
            result = result.replace(line, `<li>${line.replace(/^\s*\d+\.\s+(.*?)$/gm, '$1')}</li>`);
          }
        }
       });

       
       result = result.replace(/^\s*-\s+(.*?)$/gm, (match, text) => {
        return `<li class="markdown_list_item">${text}</li>`;
      });
      result = result.replace(/^\s*---\s*$/gm, '<hr class="markdown_horizontal" />');
     
      // Convert blockquotes (e.g., > Quote => <blockquote>Quote</blockquote>)
      result = result.replace(/^\s*> (.*)$/gm, (match, text) => {
        return `<blockquote class="markdown_blockquote">${text}</blockquote>`;
      });

      // Convert tables (e.g., | Header | Cell | => <table><thead><tr><th>Header</th><th>Cell</th></tr></thead></table>)
      result = result.replace(/((?: *\|.*?)+)\n((?: *\|.*?)+)/gm, (match, header, cell) => {
        const headerCells = header.split('|').slice(1, -1);
        const cells = cell.split('|').slice(1, -1);
        let table = '<table class="markdown_table">';
        table += '<thead class="markdown_table_head"><tr class="markdown_table_row">';
        headerCells.forEach((headerCell) => {
          table += `<th class="markdown_table_header_cell">${headerCell}</th>`;
        });
        table += '</tr></thead><tbody class="markdown_table_body"><tr class="markdown_table_row">';
        cells.forEach((cell) => {
          table += `<td class="markdown_table_body_cell">${cell}</td>`;
        });
        table += '</tr></tbody></table>';
        return table;
      });
      
    
 
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
     if(images){
        for(let i = 0; i < images.length; i++){
      let image = images[i]
      let src = image.match(/src="([^"]*)"/)
      let alt = image.match(/alt="([^"]*)"/)
      if(src){
        if(!src[1].includes('http') || !result.includes('<!-- #vader-disable_relative-paths -->')){
            // @ts-ignore
            result = result.replace(src[1],`${l}/${src[1]}`)
        }else{
            throw new Error(`Vader Error: You cannot use relative paths in the src attribute of ${src[0]}. Use absolute paths instead. \n\n${src[0]}`)
        }
      }
      if(!alt && !result.includes('<!-- #vader-disable_accessibility -->')){
         throw new Error(`Vader Error: You must include an alt attribute in the image tag  \n\n${image} of class ${e.data.name}. `)
      }
 
      // @ts-ignore
       if(!caches.match(`${l}/${src[1]}`)){
        caches.open('vader').then((cache)=>{
            // @ts-ignore
            cache.add(`${l}/${src[1]}`)
            // @ts-ignore
            console.log('cached', `${l}/${src[1]}`)
           }).catch((err)=>{
             console.log(err)
           })
       }else{
        // @ts-ignore
            console.log('already cached', caches.match(`${l}/${src[1]}`))
       }
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
   
   
    const d = result.split('<script>')

    if (d) {
      d.forEach((scriptTag, index) => {
        if (index === 0) {
          result = scriptTag;
        } else {
          if(scriptTag.includes('// <![CDATA[  <-- For SVG support')){
            return
          }
          let script = scriptTag.split('</script>')[0];
          js += script;
        }
      });
    }
     
    let  jstemplates = result.match(/(\$\(.*?\))/gs)
    if(jstemplates){
        while(jstemplates.length){
            let jstemplate = jstemplates.pop()
            // @ts-ignore
            result = result.replace(jstemplate,`$\{${jstemplate.replace('$(','').replace(')','')}\}`)
        }
    }
    postMessage({
      template: `<div data-component=${e.data.name}>${result}</div>`,
      js: js ? js : ''
    })
   
  }
