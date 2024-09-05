// node_modules/vaderjs/index.ts
function memoizeClassComponent(Component) {
  let key = Component.toString();
  if (memoizes.has(key)) {
    return memoizes.get(key);
  }
  let instance = new Component;
  memoizes.set(key, instance);
  return instance;
}
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
      let firstEl = instance.render(props);
      firstEl.props = { key: instance.key, ...firstEl.props };
      return firstEl;
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
    this.key = crypto.randomUUID();
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
    if (typeof window === "undefined")
      return [defaultValue, () => {
      }];
    let value = sessionStorage.getItem("state_" + key) ? JSON.parse(sessionStorage.getItem("state_" + key)).value : defaultValue;
    if (typeof value === "string") {
      try {
        value = JSON.parse(value);
      } catch (error) {
      }
    }
    if (!window["listener" + key] && !isServer) {
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
    let [loading, setLoading] = this.useState(loadingKey, true);
    let [error, setError] = this.useState(errorKey, null);
    let [data, setData] = this.useState(dataKey, null);
    console.log(loading, error, data);
    if (loading && !error && !data) {
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
    console.log(newl, el);
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
          console.log("child is function");
          let comp = memoizeClassComponent(Component);
          comp.Mounted = true;
          comp.render = child;
          let el2 = comp.toElement();
          el2.setAttribute("key", comp.key);
          el.appendChild(el2);
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
import Comp from "../../src/component.js";
var route = window.location.pathname.split("/").filter((v) => v !== "");
var params = {
  people: route[0],
  cop: route[1]
};
function hello() {
  return /* @__PURE__ */ e("div", null, /* @__PURE__ */ e("h1", null, "Hello"), /* @__PURE__ */ e(Comp, null));
}
export {
  hello as default
};

//# debugId=5E2606FE1A1C5DD164756E2164756E21
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL3ZhZGVyanMvaW5kZXgudHMiLCAiW3Blb3BsZV0vW2NvcF0uanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbCiAgICAiLy9AdHMtbm9jaGVja1xyXG5sZXQgaXNDbGFzc0NvbXBvbmVudCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcclxuICByZXR1cm4gZWxlbWVudC50b1N0cmluZygpLnN0YXJ0c1dpdGgoXCJjbGFzc1wiKTtcclxufTsgXHJcblxyXG5jb25zdCBtZW1vaXplcyA9IG5ldyBNYXAoKTtcclxuLy9AdHMtaWdub3JlXHJcbiBcclxuZGVjbGFyZSBnbG9iYWwge1xyXG4gIGludGVyZmFjZSBXaW5kb3cge1xyXG4gICAgb25iZWZvcmV1bmxvYWQ6IGFueTtcclxuICAgIGxvY2FsU3RvcmFnZTogYW55O1xyXG4gICAgc2Vzc2lvblN0b3JhZ2U6IGFueTtcclxuICAgIHN0YXRlOiBhbnk7XHJcbiAgfSBcclxuICBjb25zdCBnZW5LZXk6IGFueTsgXHJcbiAgLyoqXHJcbiAgICogQGRlc2NyaXB0aW9uIEFsbG93cyB5b3UgdG8gY2hlY2sgaWYgY3VycmVudCBzZXNzaW9uIGlzIHNlcnZlciBvciAgY2xpZW50XHJcbiAgICovXHJcbiAgbGV0IGlzU2VydmVyOiBib29sZWFuO1xyXG4gIC8qKlxyXG4gICAqIEBkZXNjcmlwdGlvbiAtIFRoZSBwYXJhbXMgb2JqZWN0IGlzIHVzZWQgdG8gc3RvcmUgdGhlICBwYXJhbWV0ZXJzIG9mIHRoZSBjdXJyZW50IFVSTFxyXG4gICAqIEBleGFtcGxlXHJcbiAgICogLy8gVVJMOiBodHRwczovL2V4YW1wbGUuY29tP25hbWU9Sm9oblxyXG4gICAqIGNvbnNvbGUubG9nKHBhcmFtcy5uYW1lKSAvLyBKb2huXHJcbiAgICogQGV4YW1wbGVcclxuICAgKiAvLyBVUkw6IGh0dHBzOi8vZXhhbXBsZS5jb20vOm5hbWUvOmFnZVxyXG4gICAqIC8vIEdPOiBodHRwczovL2V4YW1wbGUuY29tL0pvaG4vMjBcclxuICAgKiBjb25zb2xlLmxvZyhwYXJhbXMubmFtZSkgLy8gSm9oblxyXG4gICAqIGNvbnNvbGUubG9nKHBhcmFtcy5hZ2UpIC8vIDIwXHJcbiAgICovXHJcbiAgbGV0IHBhcmFtczogIHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XHJcbiAgbGV0IGxvY2FsU3RvcmFnZSA6IFtdXHJcbn1cclxuLy9AdHMtaWdub3JlXHJcbmdsb2JhbFRoaXMuaXNTZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ID09PSBcInVuZGVmaW5lZFwiO1xyXG4vL0B0cy1pZ25vcmVcclxuZ2xvYmFsVGhpcy5wYXJhbXMgPSB7XHJcbiAgW1N5bWJvbC5pdGVyYXRvcl06IGZ1bmN0aW9uKiAoKSB7XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0aGlzKSB7XHJcbiAgICAgIHlpZWxkIFtrZXksIHRoaXNba2V5XV07XHJcbiAgICB9XHJcbiAgfSxcclxufTtcclxuIFxyXG4gXHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIHVzZUZldGNoIGFsbG93cyB5b3UgdG8gbWFrZSBQT1NUIC0gR0VUIC0gUFVUIC0gREVMRVRFIHJlcXVlc3RzIHRoZW4gcmV0dXJucyB0aGUgZGF0YSwgbG9hZGluZyBzdGF0ZSBhbmQgZXJyb3JcclxuICogQHBhcmFtIHVybCBcclxuICogQHBhcmFtIG9wdGlvbnMgXHJcbiAqIEByZXR1cm5zICBbZGF0YSwgbG9hZGluZywgZXJyb3JdXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdXNlRmV0Y2ggPSAodXJsOiBzdHJpbmcsIG9wdGlvbnM6IGFueSkgPT4ge1xyXG4gIHJldHVybiBbbnVsbCwgdHJ1ZSwgbnVsbF07XHJcbn07XHJcblxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uICAtIEhhbmRsZSBhc3luY3Jvbm91cyBwcm9taXNlcyBhbmQgcmV0dXJuIHRoZSBkYXRhIG9yIGVycm9yOyBcclxuICogQHBhcmFtIHByb21pc2UgXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHVzZUFzeW5jU3RhdGUgPSAocHJvbWlzZTogUHJvbWlzZTxhbnk+KSA9PiB7XHJcbiAgcmV0dXJuIFtudWxsLCAoKSA9PiB7fV07XHJcbn1cclxuZXhwb3J0IGNvbnN0IHVzZUVmZmVjdCA9IChjYWxsYmFjazphbnksIGRlcGVuZGVuY2llczogYW55W10pID0+IHtcclxuICBkZXBlbmRlbmNpZXMgPSBkZXBlbmRlbmNpZXMubWFwKChkZXApID0+IGRlcC50b1N0cmluZygpKTtcclxuICBpZiAoZGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgY2FsbGJhY2soKTtcclxuICB9XHJcbn0gXHJcblxyXG5leHBvcnQgY29uc3QgRnJhZ21lbnQgPSAocHJvcHM6IGFueSwgY2hpbGRyZW46IGFueSkgPT4ge1xyXG4gIHJldHVybiAge1xyXG4gICAgdHlwZTogXCJkaXZcIixcclxuICAgIHByb3BzOiBwcm9wcyB8fCB7fSxcclxuICAgIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSxcclxuICB9XHJcbn1cclxuXHJcbmdsb2JhbFRoaXMuRnJhZ21lbnQgPSBGcmFnbWVudDtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gLSBDcmVhdGUgYSBuZXcgZWxlbWVudFxyXG4gKiBAcGFyYW0gZWxlbWVudCBcclxuICogQHBhcmFtIHByb3BzIFxyXG4gKiBAcGFyYW0gY2hpbGRyZW4gXHJcbiAqIEByZXR1cm5zIFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGUgPSAoZWxlbWVudCwgcHJvcHMsIC4uLmNoaWxkcmVuKSA9PiB7XHJcbiAgbGV0IGluc3RhbmNlO1xyXG4gIHN3aXRjaCAodHJ1ZSkge1xyXG4gICAgY2FzZSBpc0NsYXNzQ29tcG9uZW50KGVsZW1lbnQpOlxyXG4gICAgICBpbnN0YW5jZSA9IG5ldyBlbGVtZW50O1xyXG4gICAgICBpbnN0YW5jZS5wcm9wcyA9IHByb3BzO1xyXG4gICAgICBpbnN0YW5jZS5jaGlsZHJlbiA9IGNoaWxkcmVuO1xyXG4gICAgICByZXR1cm4gaW5zdGFuY2UucmVuZGVyKHByb3BzKTtcclxuICAgIGNhc2UgdHlwZW9mIGVsZW1lbnQgPT09IFwiZnVuY3Rpb25cIjpcclxuICAgICAgaW5zdGFuY2UgPSBuZXcgQ29tcG9uZW50O1xyXG4gICAgICBpbnN0YW5jZS5yZW5kZXIgPSBlbGVtZW50OyBcclxuICAgICAgbGV0IGZpcnN0RWwgPSBpbnN0YW5jZS5yZW5kZXIocHJvcHMpO1xyXG4gICAgICBmaXJzdEVsLnByb3BzID0ge2tleTogaW5zdGFuY2Uua2V5LCAuLi5maXJzdEVsLnByb3BzfTtcclxuICAgICAgcmV0dXJuIGZpcnN0RWw7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICByZXR1cm4geyB0eXBlOiBlbGVtZW50LCBwcm9wczogcHJvcHMgfHwge30sIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSB9O1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAZGVzY3JpcHRpb24gLSAgTWFuYWdlIHN0YXRlIGFuZCBmb3JjZXVwZGF0ZSBzcGVjaWZpYyBhZmZlY3RlZCBlbGVtZW50c1xyXG4gKiBAcGFyYW0ga2V5IFxyXG4gKiBAcGFyYW0gaW5pdGlhbFN0YXRlIFxyXG4gKiBAcmV0dXJucyB7c3RhdGUsICAobmV3U3RhdGU6IGFueSwgRWxlbWVudDogc3RyaW5nKSA9PiB2b2lkLCBrZXl9XHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdXNlU3RhdGUgPSA8VD4oaW5pdGlhbFN0YXRlOiBUKSA9PiB7XHJcbiAgY29uc3Qgc2V0U3RhdGUgPSAobmV3U3RhdGU6IFQpID0+IHtcclxuICAgIGluaXRpYWxTdGF0ZSA9IG5ld1N0YXRlO1xyXG4gIH1cclxuICByZXR1cm4gW2luaXRpYWxTdGF0ZSwgc2V0U3RhdGVdO1xyXG59IFxyXG5cclxuLyoqXHJcbiAqIEBkZXNjcmlwdGlvbiAtICBDcmVhdGUgYSBuZXcgY29tcG9uZW50XHJcbiAqIEBwYXJhbSBlbGVtZW50XHJcbiAqIEBwYXJhbSBwcm9wc1xyXG4gKiBAcGFyYW0gY2hpbGRyZW5cclxuICogQHJldHVybnNcclxuICogQGV4YW1wbGVcclxuICogY29uc3QgQXBwID0gKHByb3BzKSA9PiB7XHJcbiAqICAgcmV0dXJuIChcclxuICogICAgIDxkaXY+XHJcbiAqICAgICAgIDxoMT5IZWxsbywge3Byb3BzLm5hbWV9PC9oMT5cclxuICogICAgIDwvZGl2PlxyXG4gKiAgICApXHJcbiAqICB9XHJcbiAqIFxyXG4gKiAgcmVuZGVyKDxBcHAgbmFtZT1cIkpvaG5cIiAvPiwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJyb290XCIpKTtcclxuICovXHJcbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xyXG4gIHByb3BzO1xyXG4gIHN0YXRlO1xyXG4gIGVsZW1lbnQ7XHJcbiAgTW91bnRlZDtcclxuICBlZmZlY3Q7XHJcbiAga2V5O1xyXG4gIHByZXZTdGF0ZTtcclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMua2V5ID0gY3J5cHRvLnJhbmRvbVVVSUQoKTtcclxuICAgIHRoaXMucHJvcHMgPSB7fTtcclxuICAgIHRoaXMuc3RhdGUgPSB7fTtcclxuICAgIHRoaXMuZWZmZWN0ID0gW107XHJcbiAgICB0aGlzLk1vdW50ZWQgPSBmYWxzZTtcclxuICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XHJcbiAgfVxyXG4gIHVzZUVmZmVjdChjYWxsYmFjaywgZGVwZW5kZW5jaWVzKSB7XHJcbiAgICBpZiAoZGVwZW5kZW5jaWVzLmxlbmd0aCA9PT0gMCAmJiB0aGlzLk1vdW50ZWQgJiYgdGhpcy5lZmZlY3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgIHRoaXMuZWZmZWN0LnB1c2goY2FsbGJhY2spO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IGRlcGVuZGVuY2llcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmICh0aGlzLmVmZmVjdFtpXSAhPT0gZGVwZW5kZW5jaWVzW2ldKSB7XHJcbiAgICAgICAgICB0aGlzLmVmZmVjdCA9IGRlcGVuZGVuY2llcztcclxuICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gIHVzZVN0YXRlKGtleSwgZGVmYXVsdFZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdyA9PT0gXCJ1bmRlZmluZWRcIilcclxuICAgICAgcmV0dXJuIFtkZWZhdWx0VmFsdWUsICgpID0+IHtcclxuICAgICAgfV07XHJcbiAgICBsZXQgdmFsdWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwic3RhdGVfXCIgKyBrZXkpID8gSlNPTi5wYXJzZShzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwic3RhdGVfXCIgKyBrZXkpKS52YWx1ZSA6IGRlZmF1bHRWYWx1ZTtcclxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UodmFsdWUpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoIXdpbmRvd1tcImxpc3RlbmVyXCIgKyBrZXldICYmICFpc1NlcnZlcikge1xyXG4gICAgICB3aW5kb3dbXCJsaXN0ZW5lclwiICsga2V5XSA9IHRydWU7XHJcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiYmVmb3JldW5sb2FkXCIsICgpID0+IHtcclxuICAgICAgICBzZXNzaW9uU3RvcmFnZS5yZW1vdmVJdGVtKFwic3RhdGVfXCIgKyBrZXkpO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGNvbnN0IHNldFZhbHVlID0gKG5ld1ZhbHVlKSA9PiB7XHJcbiAgICAgIHZhbHVlID0gbmV3VmFsdWU7XHJcbiAgICAgIHNlc3Npb25TdG9yYWdlLnNldEl0ZW0oXCJzdGF0ZV9cIiArIGtleSwgSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiB0eXBlb2YgbmV3VmFsdWUsIHZhbHVlOiBuZXdWYWx1ZSB9KSk7XHJcbiAgICAgIHRoaXMuZm9yY2VVcGRhdGUodGhpcy5rZXkpO1xyXG4gICAgfTtcclxuICAgIHJldHVybiBbdmFsdWUsIHNldFZhbHVlXTtcclxuICB9XHJcbiAgdXNlRmV0Y2godXJsLCBvcHRpb25zKSB7XHJcbiAgICBjb25zdCBsb2FkaW5nS2V5ID0gXCJsb2FkaW5nX1wiICsgdXJsO1xyXG4gICAgY29uc3QgZXJyb3JLZXkgPSBcImVycm9yXCIgKyB1cmw7XHJcbiAgICBjb25zdCBkYXRhS2V5ID0gXCJfZGF0YVwiICsgdXJsO1xyXG4gICAgbGV0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHRoaXMudXNlU3RhdGUobG9hZGluZ0tleSwgdHJ1ZSk7XHJcbiAgICBsZXQgW2Vycm9yLCBzZXRFcnJvcl0gPSB0aGlzLnVzZVN0YXRlKGVycm9yS2V5LCBudWxsKTtcclxuICAgIGxldCBbZGF0YSwgc2V0RGF0YV0gPSB0aGlzLnVzZVN0YXRlKGRhdGFLZXksIG51bGwpO1xyXG4gICAgY29uc29sZS5sb2cobG9hZGluZywgZXJyb3IsIGRhdGEpO1xyXG4gICAgaWYgKGxvYWRpbmcgJiYgIWVycm9yICYmICFkYXRhKSB7XHJcbiAgICAgIGZldGNoKHVybCwgb3B0aW9ucykudGhlbigocmVzKSA9PiByZXMuanNvbigpKS50aGVuKChkYXRhMikgPT4geyBcclxuICAgICAgICBzZXRMb2FkaW5nKGZhbHNlKTtcclxuICAgICAgICBzZXREYXRhKGRhdGEyKTtcclxuICAgICAgICB0aGlzLmZvcmNlVXBkYXRlKHRoaXMua2V5KTtcclxuICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xyXG4gICAgICAgIHNldEVycm9yKGVycik7XHJcbiAgICAgICAgdGhpcy5mb3JjZVVwZGF0ZSh0aGlzLmtleSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIFtkYXRhLCBsb2FkaW5nLCBlcnJvcl07XHJcbiAgfVxyXG4gIGZvcmNlVXBkYXRlKGtleSkgeyBcclxuICAgIGxldCBlbCA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIipcIikpLmZpbHRlcigoZWwyKSA9PiB7XHJcbiAgICAgIHJldHVybiBlbDIua2V5ID09PSBrZXk7XHJcbiAgICB9KVswXTtcclxuICAgIGxldCBuZXdsID0gdGhpcy50b0VsZW1lbnQoKTtcclxuICAgIGNvbnNvbGUubG9nKG5ld2wsIGVsKTtcclxuICAgIGlmIChuZXdsLmtleSAhPT0ga2V5KSB7XHJcbiAgICAgIG5ld2wgPSBBcnJheS5mcm9tKG5ld2wuY2hpbGRyZW4pLmZpbHRlcigoZWwyKSA9PiBlbDIua2V5ID09PSBrZXkpWzBdO1xyXG4gICAgfVxyXG4gICAgdGhpcy5SZWNvbmNpbGVyLnVwZGF0ZShlbCwgbmV3bCk7XHJcbiAgfVxyXG4gIFJlY29uY2lsZXIgPSB7XHJcbiAgICB1cGRhdGU6IChvbGRFbGVtZW50LCBuZXdFbGVtZW50KSA9PiB7XHJcbiAgICAgIGlmICghb2xkRWxlbWVudCB8fCAhbmV3RWxlbWVudClcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIGlmICh0aGlzLlJlY29uY2lsZXIuc2hvdWxkVXBkYXRlKG9sZEVsZW1lbnQsIG5ld0VsZW1lbnQpICYmIG9sZEVsZW1lbnQudGFnTmFtZSA9PSBuZXdFbGVtZW50LnRhZ05hbWUpIHtcclxuICAgICAgICBvbGRFbGVtZW50LnJlcGxhY2VXaXRoKG5ld0VsZW1lbnQpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGxldCBjaGlsZHJlbiA9IG9sZEVsZW1lbnQuY2hpbGROb2RlcztcclxuICAgICAgICBmb3IgKGxldCBpID0gMDtpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIHRoaXMuUmVjb25jaWxlci51cGRhdGUoY2hpbGRyZW5baV0sIG5ld0VsZW1lbnQuY2hpbGROb2Rlc1tpXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgc2hvdWxkVXBkYXRlKG9sZEVsZW1lbnQsIG5ld0VsZW1lbnQpIHtcclxuICAgICAgaWYgKG9sZEVsZW1lbnQubm9kZVR5cGUgIT09IG5ld0VsZW1lbnQubm9kZVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob2xkRWxlbWVudC5ub2RlVHlwZSA9PT0gMyAmJiBuZXdFbGVtZW50Lm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgcmV0dXJuIG9sZEVsZW1lbnQudGV4dENvbnRlbnQgIT09IG5ld0VsZW1lbnQudGV4dENvbnRlbnQ7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKG9sZEVsZW1lbnQubm9kZU5hbWUgIT09IG5ld0VsZW1lbnQubm9kZU5hbWUpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICBpZiAob2xkRWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCAhPT0gbmV3RWxlbWVudC5jaGlsZE5vZGVzLmxlbmd0aCkge1xyXG4gICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG4gIHBhcnNlVG9FbGVtZW50ID0gKGVsZW1lbnQpID0+IHtcclxuICAgIGlmICghZWxlbWVudClcclxuICAgICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGVsZW1lbnQudHlwZSk7XHJcbiAgICBsZXQgaXNUZXh0ID0gdHlwZW9mIGVsZW1lbnQgPT09IFwic3RyaW5nXCIgfHwgdHlwZW9mIGVsZW1lbnQgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIGVsZW1lbnQgPT09IFwiYm9vbGVhblwiO1xyXG4gICAgaWYgKGlzVGV4dCkge1xyXG4gICAgICBlbC50ZXh0Q29udGVudCA9IGVsZW1lbnQ7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBsZXQgYXR0cmlidXRlcyA9IGVsZW1lbnQucHJvcHM7XHJcbiAgICAgIGxldCBjaGlsZHJlbiA9IGVsZW1lbnQuY2hpbGRyZW47XHJcbiAgICAgIGZvciAobGV0IGtleSBpbiBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgaWYgKGtleSA9PT0gXCJrZXlcIikgeyBcclxuICAgICAgICAgICBlbC5rZXkgPSBhdHRyaWJ1dGVzW2tleV07XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGtleSA9PT0gXCJjbGFzc05hbWVcIikge1xyXG4gICAgICAgICAgZWwuY2xhc3NOYW1lID0gYXR0cmlidXRlc1trZXldO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChrZXkgPT09IFwic3R5bGVcIikge1xyXG4gICAgICAgICAgZm9yIChsZXQgc3R5bGVLZXkgaW4gYXR0cmlidXRlc1trZXldKSB7XHJcbiAgICAgICAgICAgIGVsLnN0eWxlW3N0eWxlS2V5XSA9IGF0dHJpYnV0ZXNba2V5XVtzdHlsZUtleV07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGtleS5zdGFydHNXaXRoKFwib25cIikpIHtcclxuICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoa2V5LnN1YnN0cmluZygyKS50b0xvd2VyQ2FzZSgpLCBhdHRyaWJ1dGVzW2tleV0pO1xyXG4gICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsLnNldEF0dHJpYnV0ZShrZXksIGF0dHJpYnV0ZXNba2V5XSk7XHJcbiAgICAgIH1cclxuICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoY2hpbGQpKSB7XHJcbiAgICAgICAgICBjaGlsZC5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHRoaXMucGFyc2VUb0VsZW1lbnQoYykpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgY2hpbGQgPT09IFwiZnVuY3Rpb25cIikgeyBcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2hpbGQgaXMgZnVuY3Rpb25cIik7XHJcbiAgICAgICAgICBsZXQgY29tcCA9IG1lbW9pemVDbGFzc0NvbXBvbmVudChDb21wb25lbnQpO1xyXG4gICAgICAgICAgY29tcC5Nb3VudGVkID0gdHJ1ZTtcclxuICAgICAgICAgIGNvbXAucmVuZGVyID0gY2hpbGQ7XHJcbiAgICAgICAgICBsZXQgZWwyID0gY29tcC50b0VsZW1lbnQoKTtcclxuICAgICAgICAgIGVsMi5zZXRBdHRyaWJ1dGUoXCJrZXlcIiwgY29tcC5rZXkpO1xyXG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQoZWwyKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBjaGlsZCA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgZWwuYXBwZW5kQ2hpbGQodGhpcy5wYXJzZVRvRWxlbWVudChjaGlsZCkpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xyXG4gICAgICAgICAgc3Bhbi5pbm5lckhUTUwgPSBjaGlsZDtcclxuICAgICAgICAgIGVsLmFwcGVuZENoaWxkKHNwYW4pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH07XHJcbiAgZShlbGVtZW50LCBwcm9wcywgLi4uY2hpbGRyZW4pIHtcclxuICAgIGlmICh0eXBlb2YgZWxlbWVudCA9PT0gXCJmdW5jdGlvblwiKSB7XHJcbiAgICAgIHJldHVybiBlbGVtZW50KCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4geyB0eXBlOiBlbGVtZW50LCBwcm9wczogcHJvcHMgfHwge30sIGNoaWxkcmVuOiBjaGlsZHJlbiB8fCBbXSB9O1xyXG4gIH1cclxuICB0b0VsZW1lbnQoKSB7XHJcbiAgICBsZXQgY2hpbGRyZW4gPSB0aGlzLnJlbmRlcigpO1xyXG4gICAgaWYgKGNoaWxkcmVuLnByb3BzW1wia2V5XCJdKSB7XHJcbiAgICAgIHRoaXMua2V5ID0gY2hpbGRyZW4ucHJvcHNbXCJrZXlcIl07XHJcbiAgICB9XHJcbiAgICBsZXQgZWwgPSB0aGlzLnBhcnNlVG9FbGVtZW50KGNoaWxkcmVuKTtcclxuICAgIGVsLmtleSA9IHRoaXMua2V5O1xyXG4gICAgcmV0dXJuIGVsO1xyXG4gIH1cclxuICByZW5kZXIoKSB7XHJcbiAgICByZXR1cm4gXCJcIjtcclxuICB9XHJcbn1cclxuIFxyXG5mdW5jdGlvbiBtZW1vaXplQ2xhc3NDb21wb25lbnQoQ29tcG9uZW50OiBhbnkpIHtcclxuICBsZXQga2V5ID0gQ29tcG9uZW50LnRvU3RyaW5nKCk7XHJcbiAgaWYgKG1lbW9pemVzLmhhcyhrZXkpKSB7XHJcbiAgICByZXR1cm4gbWVtb2l6ZXMuZ2V0KGtleSk7XHJcbiAgfVxyXG4gIGxldCBpbnN0YW5jZSA9IG5ldyBDb21wb25lbnQoKTtcclxuICBtZW1vaXplcy5zZXQoa2V5LCBpbnN0YW5jZSk7XHJcbiAgcmV0dXJuIGluc3RhbmNlO1xyXG5cclxufVxyXG4vKipcclxuICogQGRlc2NyaXB0aW9uIC0gUmVuZGVyIGpzeCBDb21wb25lbmV0IHRvIHRoZSBET01cclxuICogQHBhcmFtIGVsZW1lbnQgXHJcbiAqIEBwYXJhbSBjb250YWluZXIgXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyKGVsZW1lbnQsIGNvbnRhaW5lcikgeyBcclxuICBpZiAoaXNDbGFzc0NvbXBvbmVudChlbGVtZW50KSkge1xyXG4gICAgY29uc3QgaW5zdGFuY2UgPSBuZXcgZWxlbWVudDtcclxuICAgIGluc3RhbmNlLk1vdW50ZWQgPSB0cnVlO1xyXG4gICAgbGV0IGVsID0gaW5zdGFuY2UudG9FbGVtZW50KCk7XHJcbiAgICBpbnN0YW5jZS5lbGVtZW50ID0gZWw7XHJcbiAgICBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIGNvbnRhaW5lci5yZXBsYWNlV2l0aChlbCk7XHJcbiAgfSBlbHNlIHtcclxuICAgIGxldCBtZW1vaXplZEluc3RhbmNlID0gbWVtb2l6ZUNsYXNzQ29tcG9uZW50KENvbXBvbmVudCk7XHJcbiAgICBtZW1vaXplZEluc3RhbmNlLk1vdW50ZWQgPSB0cnVlO1xyXG4gICAgbWVtb2l6ZWRJbnN0YW5jZS5yZW5kZXIgPSBlbGVtZW50LmJpbmQobWVtb2l6ZWRJbnN0YW5jZSk7XHJcbiAgICBsZXQgZWwgPSBtZW1vaXplZEluc3RhbmNlLnRvRWxlbWVudCgpOyAgXHJcbiAgICBlbC5rZXkgPSBtZW1vaXplZEluc3RhbmNlLmtleTtcclxuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgY29udGFpbmVyLnJlcGxhY2VXaXRoKGVsKTtcclxuICB9XHJcbn1cclxuIiwKICAgICJcbiAgICAgICAgbGV0IHJvdXRlID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJykuZmlsdGVyKHYgPT4gdiAhPT0gJycpIFxuICAgICAgICBsZXQgcGFyYW1zID0ge1xuICAgICAgICAgICAgcGVvcGxlOiByb3V0ZVswXSxjb3A6IHJvdXRlWzFdXG4gICAgICAgIH1cbiAgICAgICAgXG5pbXBvcnQgeyBlICwgdXNlRmV0Y2h9IGZyb20gXCJ2YWRlcmpzXCIgXG5pbXBvcnQgQ29tcCBmcm9tIFwiLi4vLi4vc3JjL2NvbXBvbmVudC5qc3hcIlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaGVsbG8oKXsgICBcbiAgICBcbiAgICByZXR1cm4gKFxuICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgPGgxPkhlbGxvPC9oMT5cbiAgICAgICAgICAgIDxDb21wPjwvQ29tcD5cbiAgICAgICAgPC9kaXY+XG4gICAgKVxufVxuICAgICAgICAiCiAgXSwKICAi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T0FBTztBQUNMLGNBQUksT0FBTyxTQUFTLGNBQWMsTUFBTTtBQUN4QyxlQUFLLFlBQVk7QUFDakIsYUFBRyxZQUFZLElBQUk7QUFBQTtBQUFBLE1BRXZCO0FBQUE7QUFFRixXQUFPO0FBQUE7QUFBQSxFQUVULENBQUMsQ0FBQyxTQUFTLFVBQVUsVUFBVTtBQUM3QixlQUFXLFlBQVksWUFBWTtBQUNqQyxhQUFPLFFBQVE7QUFBQSxJQUNqQjtBQUNBLFdBQU8sRUFBRSxNQUFNLFNBQVMsT0FBTyxTQUFTLENBQUMsR0FBRyxVQUFVLFlBQVksQ0FBQyxFQUFFO0FBQUE7QUFBQSxFQUV2RSxTQUFTLEdBQUc7QUFDVixRQUFJLFdBQVcsS0FBSyxPQUFPO0FBQzNCLFFBQUksU0FBUyxNQUFNLFFBQVE7QUFDekIsV0FBSyxNQUFNLFNBQVMsTUFBTTtBQUFBLElBQzVCO0FBQ0EsUUFBSSxLQUFLLEtBQUssZUFBZSxRQUFRO0FBQ3JDLE9BQUcsTUFBTSxLQUFLO0FBQ2QsV0FBTztBQUFBO0FBQUEsRUFFVCxNQUFNLEdBQUc7QUFDUCxXQUFPO0FBQUE7QUFFWDs7O0FDL1RBO0FBTlEsSUFBSSxRQUFRLE9BQU8sU0FBUyxTQUFTLE1BQU0sR0FBRyxFQUFFLE9BQU8sT0FBSyxNQUFNLEVBQUU7QUFDcEUsSUFBSSxTQUFTO0FBQUEsRUFDVCxRQUFRLE1BQU07QUFBQSxFQUFHLEtBQUssTUFBTTtBQUNoQztBQUlSLFNBQXdCLEtBQUssR0FBRTtBQUUzQix5QkFDSSxFQUdFLE9BSEYsc0JBQ0ksRUFBVyxNQUFYLGFBQVcsbUJBQ1gsRUFBUSxNQUFSLElBQVEsQ0FDVjtBQUFBOyIsCiAgImRlYnVnSWQiOiAiNUUyNjA2RkUxQTFDNUREMTY0NzU2RTIxNjQ3NTZFMjEiLAogICJuYW1lcyI6IFtdCn0=
