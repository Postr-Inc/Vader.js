export const document = (element: any) => { 
   let type = element.type;
   let el =  type ===  null ? `` : `<${type}` 
   let attributes = element.props;
   let children = element.children;
     if(type != null){
      for (let key in attributes) {
         if(key === "key"){ 
            el += ` key="${attributes[key]}"`;
            continue;
         }
         if (key === "className") {
            el += ` class="${attributes[key]}"`;
            continue;
         }
         if (key === "style") {
            // convert style object to string
            let styles = attributes[key];
            let styleString = "";
           // convert camelCase to kebab-case
            for (let style in styles) {
               let kebabStyle = style.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
               styleString += `${kebabStyle}:${styles[style]};`;
            }
            el += ` style="${styleString}"`;
            continue;
         }
         //@ts-ignore
         if (key.startsWith("on")){
            continue;
         }
         el += ` ${key}="${attributes[key]}"`;
   
       }
     }
    el += type === null ? `` : `>`
    if(children === null || children === undefined){
      return el;
    }
    for (let i = 0;i < children.length; i++) {
      let child = children[i]; 
      if (Array.isArray(child)) {
         child.forEach((c) => {
            el += document(c);
         });
      }
      if(typeof child === "function"){
         el += document(child());
      }else
      if (typeof child === "object") {
         el += document(child);
      }else{ 
         el += child;
      }
    }
    el += type ===  null ? `` : `</${type}>`
    return el;
}
