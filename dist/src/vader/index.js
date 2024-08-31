let isClassComponent = function(element) {
  return element.toString().startsWith("class");
};
const memoizes = new Map;
globalThis.isServer = typeof window === "undefined";
globalThis.params = {
  [Symbol.iterator]: function* () {
    for (const key in this) {
      yield [key, this[key]];
    }
  }
};
export const useFetch = (url, options) => {
  return [null, true, null];
};
export const useAsyncState = (promise) => {
  return [null, () => {
  }];
};
export const useEffect = (callback, dependencies) => {
  dependencies = dependencies.map((dep) => dep.toString());
  if (dependencies.length === 0) {
    callback();
  }
};
export const Fragment = (props, children) => {
  return {
    type: "div",
    props: props || {},
    children: children || []
  };
};
globalThis.Fragment = Fragment;
export const e = (element, props, ...children) => {
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
export const useState = (initialState) => {
  const setState = (newState) => {
    initialState = newState;
  };
  return [initialState, setState];
};

export class Component {
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
      fetch(url, options).then((res) => res.json()).then((data) => {
        setLoading(false);
        setData(data);
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
function memoizeClassComponent(Component) {
  let key = Component.toString();
  if (memoizes.has(key)) {
    return memoizes.get(key);
  }
  let instance = new Component;
  memoizes.set(key, instance);
  return instance;
}
export function render(element, container) {
  if (isClassComponent(element)) {
    const instance = new element;
    instance.Mounted = true;
    let el = instance.toElement();
    instance.element = el;
    container.innerHTML = "";
    container.replaceWith(el);
  } else {
    let memoizedInstance = memoizeClassComponent(Component);
    memoizedInstance.Mounted = true;
    memoizedInstance.render = element.bind(memoizedInstance);
    let el = memoizedInstance.toElement();
    container.innerHTML = "";
    container.replaceWith(el);
  }
}
