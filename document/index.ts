export const document = (element: any) => {
   let type = element.type;
   let el = `<${type}`;
   let attributes = element.props;
   let children = element.children;
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
         let style = "";
         for (let styleKey in attributes[key]) {
            style += `${styleKey}:${attributes[key][styleKey]};`;
         }
         el += ` style="${style}"`;
         continue;
      }
      //@ts-ignore
      if (key.startsWith("on")){
         continue;
      }
      el += ` ${key}="${attributes[key]}"`;

    }
    el += ">";
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
    el += `</${type}>`;
    return el;
}