/**
 * @file A lightweight React-like library with hooks implementation.
 * @module vader
 */

/**
 * Global variables for the fiber tree and rendering process.
 */
let nextUnitOfWork: Fiber | null = null;
let wipRoot: Fiber | null = null;
let currentRoot: Fiber | null = null;
let deletions: Fiber[] | null = null;
let wipFiber: Fiber | null = null;
let hookIndex = 0;
let isRenderScheduled = false;

interface Fiber {
  type?: string | Function;
  dom?: Node;
  props: {
    children: VNode[];
    [key: string]: any;
  };
  parent?: Fiber;
  child?: Fiber;
  sibling?: Fiber;
  alternate?: Fiber;
  effectTag?: "PLACEMENT" | "UPDATE" | "DELETION";
  hooks?: Hook[];
  key?: string | number | null;
}

interface VNode {
  type: string | Function;
  props: {
    children: VNode[];
    [key: string]: any;
  };
  key?: string | number | null;
}

interface Hook {
  state?: any;
  queue?: any[];
  deps?: any[];
  _cleanupFn?: Function;
  memoizedValue?: any;
  current?: any;
}

/**
 * Checks if a property key is an event handler.
 * @param {string} key - The property key to check.
 * @returns {boolean} True if the key is an event handler.
 */
const isEvent = (key: string) => key.startsWith("on");

/**
 * Checks if a property key is a regular property (not children or event).
 * @param {string} key - The property key to check.
 * @returns {boolean} True if the key is a regular property.
 */
const isProperty = (key: string) => key !== "children" && !isEvent(key);

/**
 * Creates a function to check if a property has changed between objects.
 * @param {object} prev - The previous object.
 * @param {object} next - The next object.
 * @returns {function} A function that takes a key and returns true if the property changed.
 */
const isNew = (prev: object, next: object) => (key: string) => prev[key] !== next[key];

/**
 * Creates a function to check if a property was removed from an object.
 * @param {object} prev - The previous object.
 * @param {object} next - The next object.
 * @returns {function} A function that takes a key and returns true if the property was removed.
 */
const isGone = (prev: object, next: object) => (key: string) => !(key in next);

/**
 * Creates a DOM node for a fiber.
 * @param {Fiber} fiber - The fiber to create a DOM node for.
 * @returns {Node} The created DOM node.
 */
function createDom(fiber: Fiber): Node {
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type as string);

  updateDom(dom, {}, fiber.props);
  return dom;
}

/**
 * Applies updated props to a DOM node.
 * @param {Node} dom - The DOM node to update.
 * @param {object} prevProps - The previous properties.
 * @param {object} nextProps - The new properties.
 */
 function updateDom(dom: Node, prevProps: object, nextProps: object): void {
  prevProps = prevProps || {};
  nextProps = nextProps || {};

  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      if (typeof prevProps[name] === 'function') {
        dom.removeEventListener(eventType, prevProps[name]);
      }
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      // FIX: Handle both `class` and `className`
      if (name === 'className' || name === 'class') {
        (dom as HTMLElement).removeAttribute("class");
      } else {
        dom[name] = "";
      }
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      if (name === 'style' && typeof nextProps[name] === 'string') {
        (dom as HTMLElement).style.cssText = nextProps[name];
      } else if (name === 'className' || name === 'class') {
        // FIX: Handle both `class` and `className`
        (dom as HTMLElement).className = nextProps[name];
      } else {
        dom[name] = nextProps[name];
      }
    });

  // Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      const handler = nextProps[name];
      if (typeof handler === 'function') {
        dom.addEventListener(eventType, handler);
      }
    });
}

/**
 * Commits the entire work-in-progress tree to the DOM.
 */
function commitRoot(): void {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
  isRenderScheduled = false;
}

/**
 * Recursively commits a fiber and its children to the DOM.
 * @param {Fiber} fiber - The fiber to commit.
 */
function commitWork(fiber: Fiber | null): void {
  if (!fiber) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber ? domParentFiber.dom : null;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    if (domParent) domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate?.props ?? {}, fiber.props);
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

/**
 * Recursively removes a fiber and its children from the DOM.
 * @param {Fiber} fiber - The fiber to remove.
 */
function commitDeletion(fiber: Fiber | null): void {
  if (!fiber) {
    return;
  }
  if (fiber.dom) {
    if (fiber.dom.parentNode) {
      fiber.dom.parentNode.removeChild(fiber.dom);
    }
  } else if (fiber.child) {
    commitDeletion(fiber.child);
  }
}

/**
 * Renders a virtual DOM element into a container.
 * @param {VNode} element - The root virtual DOM element to render.
 * @param {Node} container - The DOM container to render into.
 */
export function render(element: VNode, container: Node): void {
  container.innerHTML = "";
  
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
  
  if (!isRenderScheduled) {
    isRenderScheduled = true;
    requestAnimationFrame(workLoop);
  }
}

/**
 * The main work loop for rendering and reconciliation.
 */
function workLoop(): void {
  if (!wipRoot && currentRoot) {
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
  }

  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}

/**
 * Performs work on a single fiber unit.
 * @param {Fiber} fiber - The fiber to perform work on.
 * @returns {Fiber|null} The next fiber to work on.
 */
function performUnitOfWork(fiber: Fiber): Fiber | null {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
  return null;
}

/**
 * Updates a function component fiber.
 * @param {Fiber} fiber - The function component fiber to update.
 */
function updateFunctionComponent(fiber: Fiber): void {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = fiber.alternate ? fiber.alternate.hooks : [];

  const children = [fiber.type(fiber.props)]
    .flat()
    .filter(child => child != null && typeof child !== 'boolean')
    .map(child => typeof child === "object" ? child : createTextElement(child));

  reconcileChildren(fiber, children);
}

/**
 * Updates a host component fiber (DOM element).
 * @param {Fiber} fiber - The host component fiber to update.
 */
function updateHostComponent(fiber: Fiber): void {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children);
}

/**
 * Reconciles the children of a fiber with new elements.
 * @param {Fiber} wipFiber - The work-in-progress fiber.
 * @param {VNode[]} elements - The new child elements.
 */
function reconcileChildren(wipFiber: Fiber, elements: VNode[]): void {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling = null;

  const oldFibersByKey = new Map<string | number, Fiber>();

  while (oldFiber) {
    const key = oldFiber.key != null ? oldFiber.key : index;
    oldFibersByKey.set(key, oldFiber);
    oldFiber = oldFiber.sibling;
    index++;
  }

  index = 0;
  prevSibling = null;

  for (; index < elements.length; index++) {
    const element = elements[index];
    const key = element.key != null ? element.key : index;
    const oldFiber = oldFibersByKey.get(key);
    const sameType = oldFiber && element.type === oldFiber.type;

    let newFiber: Fiber | null = null;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        key,
      };
      oldFibersByKey.delete(key);
    } else {
      if (element) {
        newFiber = {
          type: element.type,
          props: element.props,
          dom: null,
          parent: wipFiber,
          alternate: null,
          effectTag: "PLACEMENT",
          key,
        };
      }
    }

    if (prevSibling == null) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  }

  oldFibersByKey.forEach(fiber => {
    fiber.effectTag = "DELETION";
    deletions.push(fiber);
  });

  if (prevSibling) prevSibling.sibling = null;
}

/**
 * Creates a virtual DOM element.
 * @param {string|Function} type - The type of the element.
 * @param {object} props - The element's properties.
 * @param {...any} children - The element's children.
 * @returns {VNode} The created virtual DOM element.
 */
export function createElement(
  type: string | Function,
  props?: object,
  ...children: any[]
): VNode {
  return {
    type,
    props: {
      ...props,
      children: children
        .flat()
        .filter(child => child != null && typeof child !== "boolean")
        .map(child =>
          typeof child === "object" ? child : createTextElement(child)
        ),
    },
    key: props?.key ?? null,
  };
}

/**
 * Creates a text virtual DOM element.
 * @param {string} text - The text content.
 * @returns {VNode} The created text element.
 */
function createTextElement(text: string): VNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

/**
 * A React-like useState hook for managing component state.
 * @template T
 * @param {T|(() => T)} initial - The initial state value or initializer function.
 * @returns {[T, (action: T | ((prevState: T) => T)) => void]} A stateful value and a function to update it.
 */
export function useState<T>(
  initial: T | (() => T)
): [T, (action: T | ((prevState: T) => T)) => void] {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { 
      state: typeof initial === "function" ? (initial as () => T)() : initial, 
      queue: [] 
    };
    wipFiber.hooks[hookIndex] = hook;
  }

  hook.queue.forEach((action) => {
    hook.state = typeof action === "function" ? action(hook.state) : action;
  });
  hook.queue = [];

  const setState = (action: T | ((prevState: T) => T)) => {
    hook.queue.push(action);
    if (!isRenderScheduled) {
      isRenderScheduled = true;
      requestAnimationFrame(workLoop);
    }
  };

  hookIndex++;
  return [hook.state, setState];
}

/**
 * A React-like useEffect hook for side effects.
 * @param {Function} callback - The effect callback.
 * @param {Array} deps - The dependency array.
 */
export function useEffect(callback: Function, deps?: any[]): void {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }
  
  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { deps: undefined, _cleanupFn: undefined };
    wipFiber.hooks[hookIndex] = hook;
  }
  
  const hasChanged = hook.deps === undefined || 
                   !deps || 
                   deps.some((dep, i) => !Object.is(dep, hook.deps[i]));

  if (hasChanged) {
    if (hook._cleanupFn) {
      hook._cleanupFn();
    }
    setTimeout(() => {
      const newCleanup = callback();
      if (typeof newCleanup === 'function') {
        hook._cleanupFn = newCleanup;
      } else {
        hook._cleanupFn = undefined;
      }
    }, 0);
  }
  
  hook.deps = deps;
  hookIndex++;
}

/**
 * A switch component for conditional rendering.
 * @param {object} props - The component props.
 * @param {VNode[]} props.children - The child components.
 * @returns {VNode|null} The matched child or null.
 */
export function Switch({ children }: { children: VNode[] }): VNode | null {
  const childrenArray = Array.isArray(children) ? children : [children];
  const match = childrenArray.find(child => child && child.props.when);
  if (match) {
    return match;
  }
  return childrenArray.find(child => child && child.props.default) || null;
}

/**
 * A match component for use with Switch.
 * @param {object} props - The component props.
 * @param {boolean} props.when - The condition to match.
 * @param {VNode[]} props.children - The child components.
 * @returns {VNode|null} The children if when is true, otherwise null.
 */
export function Match({ when, children }: { when: boolean, children: VNode[] }): VNode | null {
  return when ? children : null;
}

/**
 * A React-like useRef hook for mutable references.
 * @template T
 * @param {T} initial - The initial reference value.
 * @returns {{current: T}} A mutable ref object.
 */
export function useRef<T>(initial: T): { current: T } {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { current: initial };
    wipFiber.hooks[hookIndex] = hook;
  }

  hookIndex++;
  return hook;
}

/**
 * A React-like useLayoutEffect hook that runs synchronously after DOM mutations.
 * @param {Function} callback - The effect callback.
 * @param {Array} deps - The dependency array.
 */
export function useLayoutEffect(callback: Function, deps?: any[]): void {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { deps: undefined, _cleanupFn: undefined };
    wipFiber.hooks[hookIndex] = hook;
  }

  const hasChanged = hook.deps === undefined || 
                   !deps || 
                   deps.some((dep, i) => !Object.is(dep, hook.deps[i]));

  if (hasChanged) {
    if (hook._cleanupFn) {
      hook._cleanupFn();
    }
    const cleanup = callback();
    if (typeof cleanup === 'function') {
      hook._cleanupFn = cleanup;
    } else {
      hook._cleanupFn = undefined;
    }
  }

  hook.deps = deps;
  hookIndex++;
}

/**
 * A React-like useReducer hook for state management with reducers.
 * @template S
 * @template A
 * @param {(state: S, action: A) => S} reducer - The reducer function.
 * @param {S} initialState - The initial state.
 * @returns {[S, (action: A) => void]} The current state and dispatch function.
 */
export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialState: S
): [S, (action: A) => void] {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = {
      state: initialState,
      queue: [],
    };
    wipFiber.hooks[hookIndex] = hook;
  }

  hook.queue.forEach((action) => {
    hook.state = reducer(hook.state, action);
  });
  hook.queue = [];

  const dispatch = (action: A) => {
    hook.queue.push(action);
    if (!isRenderScheduled) {
      isRenderScheduled = true;
      requestAnimationFrame(workLoop);
    }
  };

  hookIndex++;
  return [hook.state, dispatch];
}

/**
 * A React-like useContext hook for accessing context values.
 * @template T
 * @param {Context<T>} Context - The context object to use.
 * @returns {T} The current context value.
 */
export function useContext<T>(Context: Context<T>): T {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let fiber = wipFiber.parent;
  while (fiber) {
    if (fiber.type && fiber.type._context === Context) {
      return fiber.props.value;
    }
    fiber = fiber.parent;
  }

  return Context._defaultValue;
}

interface Context<T> {
  _defaultValue: T;
  Provider: Function & { _context: Context<T> };
}

/**
 * Creates a context object for use with useContext.
 * @template T
 * @param {T} defaultValue - The default context value.
 * @returns {Context<T>} The created context object.
 */
export function createContext<T>(defaultValue: T): Context<T> {
  const context = {
    _defaultValue: defaultValue,
    Provider: function Provider({ children }: { children: VNode[] }) {
      return children;
    },
  };
  context.Provider._context = context;
  return context;
}

/**
 * A React-like useMemo hook for memoizing expensive calculations.
 * @template T
 * @param {() => T} factory - The function to memoize.
 * @param {Array} deps - The dependency array.
 * @returns {T} The memoized value.
 */
export function useMemo<T>(factory: () => T, deps?: any[]): T {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { memoizedValue: factory(), deps };
    wipFiber.hooks[hookIndex] = hook;
  }

  const hasChanged = hook.deps === undefined || 
                   !deps || 
                   deps.some((dep, i) => !Object.is(dep, hook.deps[i]));
  if (hasChanged) {
    hook.memoizedValue = factory();
    hook.deps = deps;
  }

  hookIndex++;
  return hook.memoizedValue;
}

/**
 * A React-like useCallback hook for memoizing functions.
 * @template T
 * @param {T} callback - The function to memoize.
 * @param {Array} deps - The dependency array.
 * @returns {T} The memoized callback.
 */
export function useCallback<T extends Function>(callback: T, deps?: any[]): T {
  return useMemo(() => callback, deps);
}

/**
 * A hook for managing arrays with common operations.
 * @template T
 * @param {T[]} initialValue - The initial array value.
 * @returns {{
 *   array: T[],
 *   add: (item: T) => void,
 *   remove: (index: number) => void,
 *   update: (index: number, item: T) => void
 * }} An object with the array and mutation functions.
 */
export function useArray<T>(initialValue: T[] = []): {
  array: T[],
  add: (item: T) => void,
  remove: (index: number) => void,
  update: (index: number, item: T) => void
} {
  const [array, setArray] = useState(initialValue);

  const add = (item: T) => {
    setArray((prevArray) => [...prevArray, item]);
  };

  const remove = (index: number) => {
    setArray((prevArray) => prevArray.filter((_, i) => i !== index));
  };

  const update = (index: number, item: T) => {
    setArray((prevArray) => prevArray.map((prevItem, i) => (i === index ? item : prevItem)));
  };

  return { array, add, remove, update };
}

/**
 * A hook for running a function at a fixed interval.
 * @param {Function} callback - The function to run.
 * @param {number|null} delay - The delay in milliseconds, or null to stop.
 */
export function useInterval(callback: Function, delay: number | null): void {
  useEffect(() => {
    if (delay === null) return;
    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [callback, delay]);
}

// Types for cache configuration
interface QueryCacheOptions {
  expiryMs?: number; // Cache duration in milliseconds
  enabled?: boolean; // Whether caching is enabled
}

// Default cache options
const DEFAULT_CACHE_OPTIONS: QueryCacheOptions = {
  expiryMs: 5 * 60 * 1000, // 5 minutes default
  enabled: true
};

// In-memory cache store
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  options: QueryCacheOptions;
}>();

export function useQuery<T>(
  url: string,
  cacheOptions: QueryCacheOptions = {} // Default to empty object
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // FIX: Destructure primitive values from cacheOptions for stable dependencies.
  const { 
    enabled = DEFAULT_CACHE_OPTIONS.enabled, 
    expiryMs = DEFAULT_CACHE_OPTIONS.expiryMs 
  } = cacheOptions;

  // FIX: Memoize the options object so its reference is stable across renders.
  // It will only be recreated if `enabled` or `expiryMs` changes.
  const mergedCacheOptions = useMemo(() => ({
    enabled,
    expiryMs,
  }), [enabled, expiryMs]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Check cache first if enabled
      if (mergedCacheOptions.enabled) {
        const cached = queryCache.get(url);
        const now = Date.now();
        
        if (cached && now - cached.timestamp < mergedCacheOptions.expiryMs) {
          setData(cached.data);
          setLoading(false);
          return;
        }
      }

      // Not in cache or expired - fetch fresh data
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Update cache if enabled
      if (mergedCacheOptions.enabled) {
        queryCache.set(url, {
          data: result,
          timestamp: Date.now(),
          options: mergedCacheOptions
        });
      }
      
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url, mergedCacheOptions]); // This dependency is now stable

  useEffect(() => {
    fetchData();
  }, [fetchData]); // This dependency is now stable

  return { data, loading, error, refetch: fetchData };
}

/**
 * A hook for tracking window focus state.
 * @returns {boolean} True if the window is focused.
 */
export function useWindowFocus(): boolean {
  const [isFocused, setIsFocused] = useState(true);

  useEffect(() => {
    const onFocus = () => setIsFocused(true);
    const onBlur = () => setIsFocused(false);

    window.addEventListener("focus", onFocus);
    window.addEventListener("blur", onBlur);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  return isFocused;
}

/**
 * A hook for syncing state with localStorage.
 * @template T
 * @param {string} key - The localStorage key.
 * @param {T} initialValue - The initial value.
 * @returns {[T, (value: T) => void]} The stored value and a function to update it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Error saving to localStorage", error);
    }
  };

  return [storedValue, setValue];
}

/**
 * A hook for detecting clicks outside an element.
 * @param {React.RefObject} ref - A ref to the element to watch.
 * @param {Function} handler - The handler to call when a click outside occurs.
 */
export function useOnClickOutside(ref: { current: HTMLElement | null }, handler: Function): void {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler(event);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}
