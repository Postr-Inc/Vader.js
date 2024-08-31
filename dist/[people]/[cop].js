// node_modules/vaderjs/index.ts
var isClassComponent = function(element) {
  return element.toString().startsWith("class");
};
var memoizes = new Map;
globalThis.isServer = typeof window === "undefined";
globalThis.params = {
  [Symbol.iterator]: function* () {
    for (const key in this) {
      yield [key, this[key]];
    }
  }
};
var Fragment = (props, children) => {
  return {
    type: "div",
    props: props || {},
    children: children || []
  };
};
globalThis.Fragment = Fragment;
var e = (element, props, ...children) => {
  let instance;
  switch (true) {
    case isClassComponent(element):
      instance = new element;
      instance.props = props;
      instance.children = children;
      return instance.render(props);
    case typeof element === "function":
      instance = new Component;
      instance.render = element;
      return instance.render();
    default:
      return { type: element, props: props || {}, children: children || [] };
  }
};
class Component {
  props;
  state;
  element;
  Mounted;
  effect;
  key;
  prevState;
  constructor() {
    this.key = Math.random().toString(36).substring(7);
    this.props = {};
    this.state = {};
    this.effect = [];
    this.Mounted = false;
    this.element = null;
  }
  useEffect(callback, dependencies) {
    if (dependencies.length === 0 && this.Mounted && this.effect.length === 0) {
      callback();
      this.effect.push(callback);
    } else {
      for (let i = 0;i < dependencies.length; i++) {
        if (this.effect[i] !== dependencies[i]) {
          this.effect = dependencies;
          callback();
        }
      }
    }
  }
  useState(key, defaultValue) {
    let value = sessionStorage.getItem("state_" + key) ? JSON.parse(sessionStorage.getItem("state_" + key)).value : defaultValue;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch (error) {
      }
    }
    if (!window["listener" + key]) {
      window["listener" + key] = true;
      window.addEventListener("beforeunload", () => {
        sessionStorage.removeItem("state_" + key);
      });
    }
    const setValue = (newValue) => {
      value = newValue;
      sessionStorage.setItem("state_" + key, JSON.stringify({ type: typeof newValue, value: newValue }));
      this.forceUpdate(this.key);
    };
    return [value, setValue];
  }
  useFetch(url, options) {
    const loadingKey = "loading_" + url;
    const errorKey = "error" + url;
    const dataKey = "_data" + url;
    let [loading, setLoading] = this.useState(loadingKey, false);
    let [error, setError] = this.useState(errorKey, null);
    let [data, setData] = this.useState(dataKey, null);
    if (loading && !error && !data) {
      this.state[this.key][loadingKey] = true;
      fetch(url, options).then((res) => res.json()).then((data2) => {
        setLoading(false);
        setData(data2);
        this.forceUpdate(this.key);
      }).catch((err) => {
        setError(err);
        this.forceUpdate(this.key);
      });
    }
    return [data, loading, error];
  }
  forceUpdate(key) {
    let el = Array.from(document.querySelectorAll("*")).filter((el2) => {
      return el2.key === key;
    })[0];
    let newl = this.toElement();
    if (newl.key !== key) {
      newl = Array.from(newl.children).filter((el2) => el2.key === key)[0];
    }
    this.Reconciler.update(el, newl);
  }
  Reconciler = {
    update: (oldElement, newElement) => {
      if (!oldElement || !newElement)
        return;
      if (this.Reconciler.shouldUpdate(oldElement, newElement) && oldElement.tagName == newElement.tagName) {
        oldElement.replaceWith(newElement);
      } else {
        let children = oldElement.childNodes;
        for (let i = 0;i < children.length; i++) {
          this.Reconciler.update(children[i], newElement.childNodes[i]);
        }
      }
    },
    shouldUpdate(oldElement, newElement) {
      if (oldElement.nodeType !== newElement.nodeType) {
        return true;
      }
      if (oldElement.nodeType === 3 && newElement.nodeType === 3) {
        return oldElement.textContent !== newElement.textContent;
      }
      if (oldElement.nodeName !== newElement.nodeName) {
        return true;
      }
      if (oldElement.childNodes.length !== newElement.childNodes.length) {
        return true;
      }
      return false;
    }
  };
  parseToElement = (element) => {
    if (!element)
      return document.createElement("div");
    let el = document.createElement(element.type);
    let isText = typeof element === "string" || typeof element === "number" || typeof element === "boolean";
    if (isText) {
      el.textContent = element;
    } else {
      let attributes = element.props;
      let children = element.children;
      for (let key in attributes) {
        if (key === "key") {
          el.key = attributes[key];
          continue;
        }
        if (key === "className") {
          el.className = attributes[key];
          continue;
        }
        if (key === "style") {
          for (let styleKey in attributes[key]) {
            el.style[styleKey] = attributes[key][styleKey];
          }
          continue;
        }
        if (key.startsWith("on")) {
          el.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
          continue;
        }
        el.setAttribute(key, attributes[key]);
      }
      for (let i = 0;i < children.length; i++) {
        let child = children[i];
        if (Array.isArray(child)) {
          child.forEach((c) => {
            el.appendChild(this.parseToElement(c));
          });
        }
        if (typeof child === "function") {
          el.appendChild(this.parseToElement(child()));
        } else if (typeof child === "object") {
          el.appendChild(this.parseToElement(child));
        } else {
          let span = document.createElement("span");
          span.innerHTML = child;
          el.appendChild(span);
        }
      }
    }
    return el;
  };
  e(element, props, ...children) {
    if (typeof element === "function") {
      return element();
    }
    return { type: element, props: props || {}, children: children || [] };
  }
  toElement() {
    let children = this.render();
    if (children.props["key"]) {
      this.key = children.props["key"];
    }
    let el = this.parseToElement(children);
    el.key = this.key;
    return el;
  }
  render() {
    return "";
  }
}

// dist/[people]/[cop].js
var route = window.location.pathname.split("/").filter((v) => v !== "");
var params = {
  people: route[0],
  cop: route[1]
};
function hello() {
  console.log(params);
  return /* @__PURE__ */ e("div", null, /* @__PURE__ */ e("p", null, "hello world"), /* @__PURE__ */ e("p", null, params.people || ""));
}
export {
  hello as default
};

//# debugId=7B50741F03F3BB3464756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3ZhZGVyanMvaW5kZXgudHMiLCAiW3Blb3BsZV0vW2NvcF0uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy9AdHMtbm9jaGVja1xyXG5sZXQgaXNDbGFzc0NvbXBvbmVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICByZXR1cm4gZWxlbWVudC50b1N0cmluZygpLnN0YXJ0c1dpdGgoXCJjbGFzc1wiKTtcclxufTsgXHJcblxyXG5jb25zdCBtZW1vaXplcyA9IG5ldyBNYXAoKTtcclxuLy9AdHMtaWdub3JlXHJcbiBcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgb25iZWZvcmV1bmxvYWQ6IGFueTtcclxuICAgIGxvY2FsU3RvcmFnZTogYW55O1xyXG4gICAgc2Vzc2lvblN0b3JhZ2U6IGFueTtcclxuICAgIHN0YXRlOiBhbnk7XHJcbiAgfSBcclxuICBjb25zdCBnZW5LZXk6IGFueTsgXHJcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEFsbG93cyB5b3UgdG8gY2hlY2sgaWYgY3VycmVudCBzZXNzaW9uIGlzIHNlcnZlciBvciAgY2xpZW50XHJcbiAgICovXHJcbiAgbGV0IGlzU2VydmVyOiBib29sZWFuO1xyXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiAtIFRoZSBwYXJhbXMgb2JqZWN0IGlzIHVzZWQgdG8gc3RvcmUgdGhlICBwYXJhbWV0ZXJzIG9mIHRoZSBjdXJyZW50IFVSTFxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogLy8gVVJMOiBodHRwczovL2V4YW1wbGUuY29tP25hbWU9Sm9oblxyXG4gICAqIGNvbnNvbGUubG9nKHBhcmFtcy5uYW1lKSAvLyBKb2huXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBVUkw6IGh0dHBzOi8vZXhhbXBsZS5jb20vOm5hbWUvOmFnZVxyXG4gICAqIC8vIEdPOiBodHRwczovL2V4YW1wbGUuY29tL0pvaG4vMjBcclxuICAgKiBjb25zb2xlLmxvZyhwYXJhbXMubmFtZSkgLy8gSm9oblxyXG4gICAqIGNvbnNvbGUubG9nKHBhcmFtcy5hZ2UpIC8vIDIwXHJcbiAgICovXHJcbiAgbGV0IHBhcmFtczogIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgbGV0IGxvY2FsU3RvcmFnZSA6IFtdXHJcbn1cclxuLy9AdHMtaWdub3JlXHJcbmdsb2JhbFRoaXMuaXNTZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiO1xyXG4vL0B0cy1pZ25vcmVcclxuZ2xvYmFsVGhpcy5wYXJhbXMgPSB7XHJcbiAgW1N5bWJvbC5pdGVyYXRvcl06IGZ1bmN0aW9uKiAoKSB7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzKSB7XHJcbiAgICAgIHlpZWxkIFtrZXksIHRoaXNba2V5XV07XHJcbiAgICB9XHJcbiAgfSxcclxufTtcclxuIFxyXG4gXHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIHVzZUZldGNoIGFsbG93cyB5b3UgdG8gbWFrZSBQT1NUIC0gR0VUIC0gUFVUIC0gREVMRVRFIHJlcXVlc3RzIHRoZW4gcmV0dXJucyB0aGUgZGF0YSwgbG9hZGluZyBzdGF0ZSBhbmQgZXJyb3JcclxuICogQHBhcmFtIHVybCBcclxuICogQHBhcmFtIG9wdGlvbnMgXHJcbiAqIEByZXR1cm5zICBbZGF0YSwgbG9hZGluZywgZXJyb3JdXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdXNlRmV0Y2ggPSAodXJsOiBzdHJpbmcsIG9wdGlvbnM6IGFueSkgPT4ge1xyXG4gIHJldHVybiBbbnVsbCwgdHJ1ZSwgbnVsbF07XHJcbn07XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAtIEhhbmRsZSBhc3luY3Jvbm91cyBwcm9taXNlcyBhbmQgcmV0dXJuIHRoZSBkYXRhIG9yIGVycm9yOyBcclxuICogQHBhcmFtIHByb21pc2UgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHVzZUFzeW5jU3RhdGUgPSAocHJvbWlzZTogUHJvbWlzZTxhbnk+KSA9PiB7XHJcbiAgcmV0dXJuIFtudWxsLCAoKSA9PiB7fV07XHJcbn1cclxuZXhwb3J0IGNvbnN0IHVzZUVmZmVjdCA9IChjYWxsYmFjazphbnksIGRlcGVuZGVuY2llczogYW55W10pID0+IHtcclxuICBkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMubWFwKChkZXApID0+IGRlcC50b1N0cmluZygpKTtcclxuICBpZiAoZGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgY2FsbGJhY2soKTtcclxuICB9XHJcbn0gXHJcblxyXG5leHBvcnQgY29uc3QgRnJhZ21lbnQgPSAocHJvcHM6IGFueSwgY2hpbGRyZW46IGFueSkgPT4ge1xyXG4gIHJldHVybiAge1xyXG4gICAgdHlwZTogXCJkaXZcIixcclxuICAgIHByb3BzOiBwcm9wcyB8fCB7fSxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSxcclxuICB9XHJcbn1cclxuXHJcbmdsb2JhbFRoaXMuRnJhZ21lbnQgPSBGcmFnbWVudDtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gLSBDcmVhdGUgYSBuZXcgZWxlbWVudFxyXG4gKiBAcGFyYW0gZWxlbWVudCBcclxuICogQHBhcmFtIHByb3BzIFxyXG4gKiBAcGFyYW0gY2hpbGRyZW4gXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGUgPSAoZWxlbWVudDogYW55LCBwcm9wczogYW55LCAuLi5jaGlsZHJlbjogYW55W10pID0+IHtcclxuICBsZXQgaW5zdGFuY2U7XHJcbiAgc3dpdGNoICh0cnVlKXtcclxuICAgIGNhc2UgaXNDbGFzc0NvbXBvbmVudChlbGVtZW50KTpcclxuICAgICAgIGluc3RhbmNlID0gbmV3IGVsZW1lbnQoKTtcclxuICAgICAgaW5zdGFuY2UucHJvcHMgPSBwcm9wcztcclxuICAgICAgaW5zdGFuY2UuY2hpbGRyZW4gPSBjaGlsZHJlbjtcclxuICAgICAgcmV0dXJuIGluc3RhbmNlLnJlbmRlcihwcm9wcyk7XHJcbiAgICBjYXNlIHR5cGVvZiBlbGVtZW50ID09PSBcImZ1bmN0aW9uXCI6XHJcbiAgICAgIGluc3RhbmNlID0gbmV3IENvbXBvbmVudCgpO1xyXG4gICAgICBpbnN0YW5jZS5yZW5kZXIgPSBlbGVtZW50O1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucmVuZGVyKCk7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyB0eXBlOiBlbGVtZW50LCBwcm9wczogcHJvcHMgfHwge30sIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSB9O1xyXG4gIH0gXHJcbn07XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIC0gIE1hbmFnZSBzdGF0ZSBhbmQgZm9yY2V1cGRhdGUgc3BlY2lmaWMgYWZmZWN0ZWQgZWxlbWVudHNcclxuICogQHBhcmFtIGtleSBcclxuICogQHBhcmFtIGluaXRpYWxTdGF0ZSBcclxuICogQHJldHVybnMge3N0YXRlLCAgKG5ld1N0YXRlOiBhbnksIEVsZW1lbnQ6IHN0cmluZykgPT4gdm9pZCwga2V5fVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHVzZVN0YXRlID0gPFQ+KGluaXRpYWxTdGF0ZTogVCkgPT4ge1xyXG4gIGNvbnN0IHNldFN0YXRlID0gKG5ld1N0YXRlOiBUKSA9PiB7XHJcbiAgICBpbml0aWFsU3RhdGUgPSBuZXdTdGF0ZTtcclxuICB9XHJcbiAgcmV0dXJuIFtpbml0aWFsU3RhdGUsIHNldFN0YXRlXTtcclxufSBcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gLSAgQ3JlYXRlIGEgbmV3IGNvbXBvbmVudFxyXG4gKiBAcGFyYW0gZWxlbWVudFxyXG4gKiBAcGFyYW0gcHJvcHNcclxuICogQHBhcmFtIGNoaWxkcmVuXHJcbiAqIEByZXR1cm5zXHJcbiAqIEBleGFtcGxlXHJcbiAqIGNvbnN0IEFwcCA9IChwcm9wcykgPT4ge1xyXG4gKiAgIHJldHVybiAoXHJcbiAqICAgICA8ZGl2PlxyXG4gKiAgICAgICA8aDE+SGVsbG8sIHtwcm9wcy5uYW1lfTwvaDE+XHJcbiAqICAgICA8L2Rpdj5cclxuICogICAgKVxyXG4gKiAgfVxyXG4gKiBcclxuICogIHJlbmRlcig8QXBwIG5hbWU9XCJKb2huXCIgLz4sIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSk7XHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcclxuICBwcm9wczogYW55O1xyXG4gIHN0YXRlOiBhbnk7XHJcbiAgZWxlbWVudDogYW55O1xyXG4gIE1vdW50ZWQ6IGJvb2xlYW47XHJcbiAgZWZmZWN0OiBhbnlbXTtcclxuICBrZXk6IHN0cmluZztcclxuICBwcmV2U3RhdGU6IGFueTtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMua2V5ID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xyXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xyXG4gICAgdGhpcy5zdGF0ZSA9IHt9O1xyXG4gICAgdGhpcy5lZmZlY3QgPSBbXTtcclxuICAgIHRoaXMuTW91bnRlZCA9IGZhbHNlO1xyXG4gICAgdGhpcy5lbGVtZW50ID0gbnVsbDsgXHJcbiAgfVxyXG4gICBcclxuXHJcbiAgdXNlRWZmZWN0KGNhbGxiYWNrOiBhbnksIGRlcGVuZGVuY2llczogYW55W10pIHtcclxuICAgIGlmIChkZXBlbmRlbmNpZXMubGVuZ3RoID09PSAwICYmIHRoaXMuTW91bnRlZCAmJiB0aGlzLmVmZmVjdC5sZW5ndGggPT09IDApIHsgXHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgIHRoaXMuZWZmZWN0LnB1c2goY2FsbGJhY2spO1xyXG4gICAgfWVsc2V7XHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGVwZW5kZW5jaWVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZWZmZWN0W2ldICE9PSBkZXBlbmRlbmNpZXNbaV0pIHtcclxuICAgICAgICAgIHRoaXMuZWZmZWN0ID0gZGVwZW5kZW5jaWVzO1xyXG4gICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9IFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSAgXHJcbiAgIHVzZVN0YXRlPFQ+KGtleTogc3RyaW5nLCBkZWZhdWx0VmFsdWU6IFQpIHtcclxuICAgIGxldCB2YWx1ZSA9IHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJzdGF0ZV9cIiArIGtleSkgPyBKU09OLnBhcnNlKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJzdGF0ZV9cIiArIGtleSkpLnZhbHVlIDogZGVmYXVsdFZhbHVlO1xyXG4gIFxyXG4gICAgLy8gUGFyc2UgdmFsdWUgaWYgaXQncyBhIHN0cmluZ2lmaWVkIG9iamVjdCBvciBudW1iZXJcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAvLyBOb3QgYSB2YWxpZCBKU09OLCBrZWVwIGl0IGFzIGlzXHJcbiAgICAgIH1cclxuICAgIH1cclxuICBcclxuICAgIC8vIEFkZCBsaXN0ZW5lciBmb3IgdW5sb2FkIGV2ZW50IHRvIHNhdmUgc3RhdGVcclxuICAgIGlmICghd2luZG93WydsaXN0ZW5lcicgKyBrZXldKSB7XHJcbiAgICAgIHdpbmRvd1snbGlzdGVuZXInICsga2V5XSA9IHRydWU7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB7XHJcbiAgICAgICAgc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnc3RhdGVfJyArIGtleSlcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgXHJcbiAgICBjb25zdCBzZXRWYWx1ZSA9IChuZXdWYWx1ZTogVCkgPT4ge1xyXG4gICAgICB2YWx1ZSA9IG5ld1ZhbHVlO1xyXG4gICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwic3RhdGVfXCIgKyBrZXksIEpTT04uc3RyaW5naWZ5KHsgdHlwZTogdHlwZW9mIG5ld1ZhbHVlLCB2YWx1ZTogbmV3VmFsdWUgfSkpO1xyXG4gICAgICB0aGlzLmZvcmNlVXBkYXRlKHRoaXMua2V5KVxyXG4gICAgfTtcclxuICBcclxuICAgIHJldHVybiBbdmFsdWUgYXMgVCwgc2V0VmFsdWVdO1xyXG4gIH1cclxuICBcclxuIFxyXG5cclxuICB1c2VGZXRjaCh1cmw6IHN0cmluZywgb3B0aW9uczogYW55KSB7IFxyXG4gICAgY29uc3QgbG9hZGluZ0tleSA9IFwibG9hZGluZ19cIiArIHVybDtcclxuICAgIGNvbnN0IGVycm9yS2V5ID0gXCJlcnJvclwiICsgdXJsO1xyXG4gICAgY29uc3QgZGF0YUtleSA9IFwiX2RhdGFcIiArIHVybDsgXHJcbiAgICAgbGV0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHRoaXMudXNlU3RhdGUobG9hZGluZ0tleSwgZmFsc2UpO1xyXG4gICAgIGxldCBbZXJyb3IsIHNldEVycm9yXSA9IHRoaXMudXNlU3RhdGUoZXJyb3JLZXksIG51bGwpO1xyXG4gICAgIGxldCBbZGF0YSwgc2V0RGF0YV0gPSB0aGlzLnVzZVN0YXRlKGRhdGFLZXksIG51bGwpO1xyXG5cclxuICAgIGlmIChsb2FkaW5nICYmICFlcnJvciAmJiAhZGF0YSkge1xyXG4gICAgICAgIHRoaXMuc3RhdGVbdGhpcy5rZXldW2xvYWRpbmdLZXldID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgZmV0Y2godXJsLCBvcHRpb25zKVxyXG4gICAgICAgICAgICAudGhlbigocmVzKSA9PiByZXMuanNvbigpKVxyXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xyXG4gICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxyXG4gICAgICAgICAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7IFxyXG4gICAgICAgICAgICAgICAgc2V0RGF0YShkYXRhKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUodGhpcy5rZXkpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgICAgICAgICAgc2V0RXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuZm9yY2VVcGRhdGUodGhpcy5rZXkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW2RhdGEsIGxvYWRpbmcsIGVycm9yXTtcclxufVxyXG5cclxuXHJcbiAgZm9yY2VVcGRhdGUoa2V5KSB7IFxyXG4gICAgLy9AdHMtaWdub3JlXHJcbiAgICBsZXQgZWwgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIqXCIpKS5maWx0ZXIoKGVsMjogYW55KSA9PnsgcmV0dXJuIGVsMi5rZXkgPT09IGtleX0pWzBdOyBcclxuICAgIGxldCBuZXdsID0gdGhpcy50b0VsZW1lbnQoKTsgXHJcbiAgICBpZihuZXdsLmtleSAhPT0ga2V5KXsgIFxyXG4gICAgICAvL0B0cy1pZ25vcmUgXHJcbiAgICAgIG5ld2wgPSBBcnJheS5mcm9tKG5ld2wuY2hpbGRyZW4pLmZpbHRlcigoZWwyKSA9PiBlbDIua2V5ID09PSBrZXkpWzBdO1xyXG4gICAgfSAgXHJcbiAgICB0aGlzLlJlY29uY2lsZXIudXBkYXRlKGVsLCBuZXdsKTtcclxuICB9XHJcbiAgUmVjb25jaWxlciA9IHtcclxuICAgIHVwZGF0ZTogKG9sZEVsZW1lbnQsIG5ld0VsZW1lbnQpID0+IHsgIFxyXG4gICAgICBpZighb2xkRWxlbWVudCB8fCAhbmV3RWxlbWVudCkgcmV0dXJuO1xyXG4gICAgICBpZiAodGhpcy5SZWNvbmNpbGVyLnNob3VsZFVwZGF0ZShvbGRFbGVtZW50LCBuZXdFbGVtZW50KSAmJiBvbGRFbGVtZW50LnRhZ05hbWUgPT0gbmV3RWxlbWVudC50YWdOYW1lKXsgXHJcbiAgICAgICAgICBvbGRFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0VsZW1lbnQpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbGV0IGNoaWxkcmVuID0gb2xkRWxlbWVudC5jaGlsZE5vZGVzO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHsgXHJcbiAgICAgICAgICB0aGlzLlJlY29uY2lsZXIudXBkYXRlKGNoaWxkcmVuW2ldLCBuZXdFbGVtZW50LmNoaWxkTm9kZXNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgICBzaG91bGRVcGRhdGUob2xkRWxlbWVudCwgbmV3RWxlbWVudCkgeyAgXHJcbiAgICAgIGlmIChvbGRFbGVtZW50Lm5vZGVUeXBlICE9PSBuZXdFbGVtZW50Lm5vZGVUeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9sZEVsZW1lbnQubm9kZVR5cGUgPT09IDMgJiYgbmV3RWxlbWVudC5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIHJldHVybiBvbGRFbGVtZW50LnRleHRDb250ZW50ICE9PSBuZXdFbGVtZW50LnRleHRDb250ZW50O1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChvbGRFbGVtZW50Lm5vZGVOYW1lICE9PSBuZXdFbGVtZW50Lm5vZGVOYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9sZEVsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGggIT09IG5ld0VsZW1lbnQuY2hpbGROb2Rlcy5sZW5ndGgpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfTsgXHJcbiAgIFxyXG4gIHBhcnNlVG9FbGVtZW50ID0gKGVsZW1lbnQ6IGFueSkgPT4geyBcclxuICAgIGlmKCFlbGVtZW50KSByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoZWxlbWVudC50eXBlKTtcclxuICAgIGxldCBpc1RleHQgPSB0eXBlb2YgZWxlbWVudCA9PT0gXCJzdHJpbmdcIiB8fCB0eXBlb2YgZWxlbWVudCA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgZWxlbWVudCA9PT0gXCJib29sZWFuXCI7XHJcbiAgICBpZiAoaXNUZXh0KSB7XHJcbiAgICAgIGVsLnRleHRDb250ZW50ID0gZWxlbWVudDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxldCBhdHRyaWJ1dGVzID0gZWxlbWVudC5wcm9wcztcclxuICAgICAgbGV0IGNoaWxkcmVuID0gZWxlbWVudC5jaGlsZHJlbjtcclxuICAgICAgZm9yIChsZXQga2V5IGluIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICBpZihrZXkgPT09IFwia2V5XCIpeyBcclxuICAgICAgICAgIGVsLmtleSA9IGF0dHJpYnV0ZXNba2V5XTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoa2V5ID09PSBcImNsYXNzTmFtZVwiKSB7XHJcbiAgICAgICAgICBlbC5jbGFzc05hbWUgPSBhdHRyaWJ1dGVzW2tleV07XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGtleSA9PT0gXCJzdHlsZVwiKSB7XHJcbiAgICAgICAgICBmb3IgKGxldCBzdHlsZUtleSBpbiBhdHRyaWJ1dGVzW2tleV0pIHtcclxuICAgICAgICAgICAgZWwuc3R5bGVbc3R5bGVLZXldID0gYXR0cmlidXRlc1trZXldW3N0eWxlS2V5XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL0B0cy1pZ25vcmVcclxuICAgICAgICBpZiAoa2V5LnN0YXJ0c1dpdGgoXCJvblwiKSkgeyAgXHJcbiAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGtleS5zdWJzdHJpbmcoMikudG9Mb3dlckNhc2UoKSwgYXR0cmlidXRlc1trZXldKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbC5zZXRBdHRyaWJ1dGUoa2V5LCBhdHRyaWJ1dGVzW2tleV0pO1xyXG4gICAgICB9XHJcbiAgICAgIGZvciAobGV0IGkgPSAwO2kgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBjaGlsZCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNoaWxkKSkge1xyXG4gICAgICAgICAgY2hpbGQuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLnBhcnNlVG9FbGVtZW50KGMpKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZih0eXBlb2YgY2hpbGQgPT09IFwiZnVuY3Rpb25cIil7XHJcbiAgICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLnBhcnNlVG9FbGVtZW50KGNoaWxkKCkpKTtcclxuICAgICAgICB9ZWxzZVxyXG4gICAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09IFwib2JqZWN0XCIpIHtcclxuICAgICAgICBlbC5hcHBlbmRDaGlsZCh0aGlzLnBhcnNlVG9FbGVtZW50KGNoaWxkKSk7XHJcbiAgICAgICAgfWVsc2V7IFxyXG4gICAgICAgICAgIGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XHJcbiAgICAgICAgICAgIHNwYW4uaW5uZXJIVE1MID0gY2hpbGQ7XHJcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHNwYW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH07XHJcbiAgZShlbGVtZW50OiBzdHJpbmcgfCBGdW5jdGlvbiwgcHJvcHM6IGFueSwgLi4uY2hpbGRyZW46IGFueVtdKSB7XHJcbiAgICBpZih0eXBlb2YgZWxlbWVudCA9PT0gXCJmdW5jdGlvblwiKXtcclxuICAgICAgcmV0dXJuIGVsZW1lbnQoKTtcclxuICAgIH1cclxuICAgIHJldHVybiB7IHR5cGU6IGVsZW1lbnQsIHByb3BzOiBwcm9wcyB8fCB7fSwgY2hpbGRyZW46IGNoaWxkcmVuIHx8IFtdIH07XHJcbiAgfVxyXG4gIHRvRWxlbWVudCgpIHsgXHJcbiAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLnJlbmRlcigpO1xyXG4gICAgLy9AdHMtaWdub3JlXHJcbiAgICBpZihjaGlsZHJlbi5wcm9wc1sna2V5J10pe1xyXG4gICAgICB0aGlzLmtleSA9IGNoaWxkcmVuLnByb3BzWydrZXknXTtcclxuICAgIH1cclxuICAgIGxldCBlbCA9IHRoaXMucGFyc2VUb0VsZW1lbnQoY2hpbGRyZW4pO1xyXG4gICAgZWwua2V5ID0gdGhpcy5rZXk7ICBcclxuICAgIHJldHVybiBlbDtcclxuICB9XHJcbiAgcmVuZGVyKCkge1xyXG4gICAgcmV0dXJuIFwiXCI7XHJcbiAgfVxyXG5cclxuICBcclxufVxyXG4gXHJcbmZ1bmN0aW9uIG1lbW9pemVDbGFzc0NvbXBvbmVudChDb21wb25lbnQ6IGFueSkge1xyXG4gIGxldCBrZXkgPSBDb21wb25lbnQudG9TdHJpbmcoKTtcclxuICBpZiAobWVtb2l6ZXMuaGFzKGtleSkpIHtcclxuICAgIHJldHVybiBtZW1vaXplcy5nZXQoa2V5KTtcclxuICB9XHJcbiAgbGV0IGluc3RhbmNlID0gbmV3IENvbXBvbmVudCgpO1xyXG4gIG1lbW9pemVzLnNldChrZXksIGluc3RhbmNlKTtcclxuICByZXR1cm4gaW5zdGFuY2U7XHJcblxyXG59XHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gLSBSZW5kZXIganN4IENvbXBvbmVuZXQgdG8gdGhlIERPTVxyXG4gKiBAcGFyYW0gZWxlbWVudCBcclxuICogQHBhcmFtIGNvbnRhaW5lciBcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZW5kZXIoZWxlbWVudDogYW55LCBjb250YWluZXI6IEhUTUxFbGVtZW50KSB7XHJcbiAgaWYgKGlzQ2xhc3NDb21wb25lbnQoZWxlbWVudCkpIHtcclxuICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IGVsZW1lbnQoKTsgIFxyXG4gICAgaW5zdGFuY2UuTW91bnRlZCA9IHRydWU7ICBcclxuICAgIGxldCBlbCA9IGluc3RhbmNlLnRvRWxlbWVudCgpOyAgXHJcbiAgICBpbnN0YW5jZS5lbGVtZW50ID0gZWw7ICBcclxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiOyBcclxuICAgIGNvbnRhaW5lci5yZXBsYWNlV2l0aChlbCk7XHJcbiAgfSBlbHNlIHsgXHJcbiAgICAgbGV0IG1lbW9pemVkSW5zdGFuY2UgPSBtZW1vaXplQ2xhc3NDb21wb25lbnQoQ29tcG9uZW50KTtcclxuICAgICAgbWVtb2l6ZWRJbnN0YW5jZS5Nb3VudGVkID0gdHJ1ZTtcclxuICAgICAgbWVtb2l6ZWRJbnN0YW5jZS5yZW5kZXIgPSAgZWxlbWVudC5iaW5kKG1lbW9pemVkSW5zdGFuY2UpO1xyXG4gICAgICBsZXQgZWwgPSBtZW1vaXplZEluc3RhbmNlLnRvRWxlbWVudCgpOyBcclxuICAgICAgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICAgIGNvbnRhaW5lci5yZXBsYWNlV2l0aChlbCk7XHJcblxyXG4gIH1cclxufSIsCiAgICAiXG4gICAgICAgIGxldCByb3V0ZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpLmZpbHRlcih2ID0+IHYgIT09ICcnKSBcbiAgICAgICAgbGV0IHBhcmFtcyA9IHtcbiAgICAgICAgICAgIHBlb3BsZTogcm91dGVbMF0sY29wOiByb3V0ZVsxXVxuICAgICAgICB9XG4gICAgICAgIFxuaW1wb3J0IHsgZSB9IGZyb20gXCJ2YWRlcmpzXCIgXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBoZWxsbygpeyBcbiAgICBjb25zb2xlLmxvZyhwYXJhbXMpXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAgaGVsbG8gd29ybGRcbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDxwPlxuICAgICAgICAgICAge3BhcmFtcy5wZW9wbGUgfHwgXCJcIn1cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgKVxufVxuICAgICAgICAiCiAgXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsSUFBSSwyQkFBMkIsQ0FBQyxTQUFTO0FBQ3ZDLFNBQU8sUUFBUSxTQUFTLEVBQUUsV0FBVyxPQUFPO0FBQUE7QUFHOUMsSUFBTSxXQUFXLElBQUk7QUE4QnJCLFdBQVcsa0JBQWtCLFdBQVc7QUFFeEMsV0FBVyxTQUFTO0FBQUEsR0FDakIsT0FBTyxxQkFBcUIsR0FBRztBQUM5QixlQUFXLE9BQU8sTUFBTTtBQUN0QixZQUFNLENBQUMsS0FBSyxLQUFLLElBQUk7QUFBQSxJQUN2QjtBQUFBO0FBRUo7QUE2Qk8sSUFBTSxXQUFXLENBQUMsT0FBWSxhQUFrQjtBQUNyRCxTQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixPQUFPLFNBQVMsQ0FBQztBQUFBLElBQ2pCLFVBQVUsWUFBWSxDQUFDO0FBQUEsRUFDekI7QUFBQTtBQUdGLFdBQVcsV0FBVztBQVNmLElBQU0sSUFBSSxDQUFDLFNBQWMsVUFBZSxhQUFvQjtBQUNqRSxNQUFJO0FBQ0osVUFBUTtBQUFBLFNBQ0QsaUJBQWlCLE9BQU87QUFDMUIsaUJBQVcsSUFBSTtBQUNoQixlQUFTLFFBQVE7QUFDakIsZUFBUyxXQUFXO0FBQ3BCLGFBQU8sU0FBUyxPQUFPLEtBQUs7QUFBQSxnQkFDbEIsWUFBWTtBQUN0QixpQkFBVyxJQUFJO0FBQ2YsZUFBUyxTQUFTO0FBQ2xCLGFBQU8sU0FBUyxPQUFPO0FBQUE7QUFFdkIsYUFBTyxFQUFFLE1BQU0sU0FBUyxPQUFPLFNBQVMsQ0FBQyxHQUFHLFVBQVUsWUFBWSxDQUFDLEVBQUU7QUFBQTtBQUFBO0FBa0NwRSxNQUFNLFVBQVU7QUFBQSxFQUNyQjtBQUFB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LFlBQVksQ0FBQyxFQUFFO0FBQUE7QUFBQSxFQUV2RSxTQUFTLEdBQUc7QUFDVixRQUFJLFdBQVcsS0FBSyxPQUFPO0FBRTNCLFFBQUcsU0FBUyxNQUFNLFFBQU87QUFDdkIsV0FBSyxNQUFNLFNBQVMsTUFBTTtBQUFBLElBQzVCO0FBQ0EsUUFBSSxLQUFLLEtBQUssZUFBZSxRQUFRO0FBQ3JDLE9BQUcsTUFBTSxLQUFLO0FBQ2QsV0FBTztBQUFBO0FBQUEsRUFFVCxNQUFNLEdBQUc7QUFDUCxXQUFPO0FBQUE7QUFJWDs7O0FDbFZRLElBQUksUUFBUSxPQUFPLFNBQVMsU0FBUyxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQUssTUFBTSxFQUFFO0FBQ3BFLElBQUksU0FBUztBQUFBLEVBQ1QsUUFBUSxNQUFNO0FBQUEsRUFBRyxLQUFLLE1BQU07QUFDaEM7QUFHUixTQUF3QixLQUFLLEdBQUU7QUFDM0IsVUFBUSxJQUFJLE1BQU07QUFDbEIseUJBQ0ksRUFPRSxPQVBGLHNCQUNJLEVBRUUsS0FGRixtQkFFRSxtQkFDRixFQUVFLEtBRkYsTUFDQyxPQUFPLFVBQVUsRUFDaEIsQ0FDSjtBQUFBOyIsCiAgImRlYnVnSWQiOiAiN0I1MDc0MUYwM0YzQkIzNDY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
