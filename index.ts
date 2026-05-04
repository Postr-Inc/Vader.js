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
// Add to the top of your Vader.js file
 
 
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
  ref?: any; 
  propsCache?: Record<string, any>;
  __compareProps?: (prev: any, next: any) => boolean;
  __skipMemo?: boolean;
  _needsUpdate?: boolean; 
}

export interface VNode {
  type: string | Function;
  props: {
    children: VNode[];
    [key: string]: any;
  };
  key?: string | number | null;
  ref?: any; // ✅ Add this for ref support
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

 function shouldSetAsProperty(name: string, isSvg: boolean): boolean {
  // These should always be set as properties (when possible)
  const propertyNames = [
    'value', 'checked', 'selected', 'disabled', 'readOnly',
    'multiple', 'muted', 'defaultChecked', 'defaultValue'
  ];
  
  // These should always be set as attributes
  const attributeNames = [
    'aria-', 'data-', 'role', 'tabindex', 'for', 'class', 'style',
    'id', 'name', 'type', 'placeholder', 'href', 'src', 'alt',
    'title', 'width', 'height', 'viewBox', 'fill', 'stroke'
  ];
  
  // Check if it's a boolean attribute
  if (name in dom && typeof (dom as any)[name] === 'boolean') {
    return true;
  }
  
  // Check property list
  if (propertyNames.includes(name)) {
    return true;
  }
  
  // Check attribute patterns
  if (attributeNames.some(attr => name.startsWith(attr)) || name.includes('-')) {
    return false;
  }
  
  // For SVG, prefer attributes
  if (isSvg) {
    return false;
  }
  
  // Default to property if it exists on the DOM element
  return name in dom;
}
/**
 * Checks if a property key is a regular property (not children or event).
 * @param {string} key - The property key to check.
 * @returns {boolean} True if the key is a regular property.
 */
const isProperty = (key: string) => 
  key !== "children" && 
  !isEvent(key) && 
  key !== "ref" && 
  key !== "key" && 
  key !== "__source" && 
  key !== "__self";

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
  let dom: Node;
  const isSvg = isSvgElement(fiber);

  if (fiber.type === "TEXT_ELEMENT") {
    dom = document.createTextNode(fiber.props.nodeValue || "");
  } else {
    if (isSvg) {
      dom = document.createElementNS("http://www.w3.org/2000/svg", fiber.type as string);
    } else {
      dom = document.createElement(fiber.type as string);
    }
  }

  // Update props (attributes, events, etc.)
  updateDom(dom, {}, fiber.props, isSvg);

  fiber.dom = dom;
  return dom;
}


function isSvgElement(fiber: Fiber): boolean {
  // Check if the fiber is an <svg> itself or inside an <svg>
  let parent = fiber.parent; 
  if (fiber.type === "svg") return true;
  while (parent) {
    if (parent.type === "svg") return true;
    parent = parent.parent;
  }
  return false;
}


 /**
 * Applies updated props to a DOM node.
 * @param {Node} dom - The DOM node to update.
 * @param {object} prevProps - The previous properties.
 * @param {object} nextProps - The new properties.
 */
function updateDom(dom: Node, prevProps: any, nextProps: any, isSvg: boolean = false): void {
  prevProps = prevProps || {};
  nextProps = nextProps || {};

  if (dom.nodeType === Node.TEXT_NODE) {
    if (prevProps.nodeValue !== nextProps.nodeValue) {
      (dom as Text).nodeValue = nextProps.nodeValue;
    }
    return;
  }

  // Handle ref updates
  if (prevProps.ref && prevProps.ref !== nextProps.ref) {
    if (prevProps.ref.current === dom) {
      prevProps.ref.current = null;
    }
  }
  if (nextProps.ref && nextProps.ref !== prevProps.ref) {
    nextProps.ref.current = dom;
  }

  // Remove old event listeners
  Object.keys(prevProps)
    .filter(key => key.startsWith("on"))
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      const handler = prevProps[name];
      if (typeof handler === 'function') {
        (dom as Element).removeEventListener(eventType, handler);
      }
    });

  // ✅ FIX: Handle className updates properly
  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      if (name === 'className' || name === 'class') {
        (dom as Element).setAttribute('class', '');
      } else if (name === 'style') {
        (dom as HTMLElement).style.cssText = '';
      } else if (name in dom && !isSvg) {
        (dom as any)[name] = '';
      } else {
        (dom as Element).removeAttribute(name);
      }
    });

  // ✅ FIX: Set new or changed properties - IMPORTANT FIX for className
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const value = nextProps[name];
      
      if (name === 'style') {
        if (typeof value === 'string') {
          (dom as HTMLElement).style.cssText = value;
        } else if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([key, val]) => {
            const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
            (dom as HTMLElement).style[cssKey as any] = val;
          });
        }
      } else if (name === 'className' || name === 'class') {
        // ✅ FIX: Set the entire className, don't append!
        if (value) {
          (dom as Element).setAttribute('class', value);
        } else {
          (dom as Element).removeAttribute('class');
        }
      } else if (typeof value === 'boolean') {
        if (value) {
          (dom as Element).setAttribute(name, '');
        } else {
          (dom as Element).removeAttribute(name);
        }
      } else if (name.includes('-') || isSvg) {
        (dom as Element).setAttribute(name, value);
      } else if (name in dom && !isSvg) {
        try {
          (dom as any)[name] = value;
        } catch {
          (dom as Element).setAttribute(name, value);
        }
      } else {
        (dom as Element).setAttribute(name, value);
      }
    });

  // Add new event listeners
  Object.keys(nextProps)
    .filter(key => key.startsWith("on"))
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      const handler = nextProps[name];
      if (typeof handler === 'function') {
        // Remove any existing listener first
        if (prevProps[name]) {
          (dom as Element).removeEventListener(eventType, prevProps[name]);
        }
        // Add the new listener
        (dom as Element).addEventListener(eventType, handler);
      }
    });
}


/**
 * Commits the entire work-in-progress tree to the DOM.
 */
function commitRoot(): void {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  
  // Run effects after DOM is committed
  runEffects(wipRoot);
  
  currentRoot = wipRoot;
  wipRoot = null;
  isRenderScheduled = false;
}

function runEffects(fiber: Fiber | null): void {
  if (!fiber) return;
  
  // Run effects for this fiber
  if (fiber._pendingEffects) {
    fiber._pendingEffects.forEach(({ callback, cleanup, hookIndex }) => {
      // Run cleanup from previous effect
      if (cleanup) {
        try {
          cleanup();
        } catch (err) {
          console.error('Error in effect cleanup:', err);
        }
      }
      
      // Run the new effect
      try {
        const newCleanup = callback();
        
        // Store the cleanup function in the hook
        if (fiber.hooks && fiber.hooks[hookIndex]) {
          fiber.hooks[hookIndex]._cleanupFn = typeof newCleanup === 'function' ? newCleanup : undefined;
        }
      } catch (err) {
        console.error('Error in effect:', err);
      }
    });
    
    // Clear pending effects
    fiber._pendingEffects = [];
  }
  
  // Recursively run effects for children
  runEffects(fiber.child);
  runEffects(fiber.sibling);
}

/**
 * Recursively commits a fiber and its children to the DOM.
 * @param {Fiber} fiber - The fiber to commit.
 */
 function commitWork(fiber: Fiber | null): void {
  if (!fiber) return;

  let domParentFiber = fiber.parent;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber?.dom ?? null;

  if (fiber.effectTag === "PLACEMENT" && fiber.dom != null) {
    if (domParent) {
      domParent.appendChild(fiber.dom);
    }
    // ✅ Assign ref from fiber
    if (fiber.ref && fiber.dom) {
      assignRef(fiber.ref, fiber.dom);
    }
  } else if (fiber.effectTag === "UPDATE" && fiber.dom != null) {
    const prevProps = fiber.alternate?.props ?? {};
    const nextProps = fiber.props;
    updateDom(fiber.dom, prevProps, nextProps);
    
    // ✅ Handle ref updates from fiber
    const prevRef = fiber.alternate?.ref;
    const nextRef = fiber.ref;
    
    if (prevRef !== nextRef) {
      if (prevRef) {
        assignRef(prevRef, null);
      }
      if (nextRef && fiber.dom) {
        assignRef(nextRef, fiber.dom);
      }
    } else if (nextRef && fiber.dom) {
      // Ensure ref is still set
      assignRef(nextRef, fiber.dom);
    }
  } else if (fiber.effectTag === "DELETION") {
    commitDeletion(fiber);
    return;
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// ✅ Helper function to assign refs safely
function assignRef(ref: any, dom: Node | null): void {
  if (typeof ref === 'function') {
    ref(dom);
  } else if (ref && typeof ref === 'object') {
    ref.current = dom;
  }
}


/**
 * Recursively removes a fiber and its children from the DOM.
 * @param {Fiber} fiber - The fiber to remove.
 */
function commitDeletion(fiber: Fiber | null): void {
  if (!fiber) return;
  
  // Clear refs recursively
  const clearRefs = (f: Fiber) => {
    if (f.ref) {
      assignRef(f.ref, null);
    }
    if (f.child) clearRefs(f.child);
    if (f.sibling) clearRefs(f.sibling);
  };
  
  clearRefs(fiber);
  
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
 requestAnimationFrame(workLoop);
}

/**
 * The main work loop for rendering and reconciliation.
 */
function workLoop(): void {
  // If there's a scheduled render but no wipRoot, create one
  if (!nextUnitOfWork && !wipRoot && currentRoot) {
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    deletions = [];
    nextUnitOfWork = wipRoot;
  }

  // Perform work
  while (nextUnitOfWork) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }

  // Commit changes if we've finished all work
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
function updateFunctionComponent(fiber: Fiber) {
  // Store the current fiber globally for hooks
  wipFiber = fiber;
  hookIndex = 0;
  
  // Initialize hooks array if needed
  if (!fiber.hooks) {
    fiber.hooks = [];
  }
  
  // Copy hooks from alternate but ensure they're fresh
  if (fiber.alternate?.hooks) {
    // Create new hooks array with same structure
    fiber.hooks = fiber.alternate.hooks.map(altHook => {
      // Create a shallow copy to avoid mutation issues
      const newHook = { ...altHook };
      return newHook;
    });
  }

  // Call the component function
  const children = (fiber.type as Function)(fiber.props);
  
  // Normalize and reconcile children
  const normalizedChildren = normalizeChildren(children, fiber);
  reconcileChildren(fiber, normalizedChildren);
  
  // Clean up
  wipFiber = null;
}
function normalizeChildren(children: any, parentFiber: Fiber): VNode[] {
  if (!children) return [];
  
  // Handle arrays, single elements, and conditional rendering
  let arr = Array.isArray(children) ? children.flat() : [children];
  
  return arr.filter(child => child != null && typeof child !== "boolean").map((child, index) => {
    if (typeof child === "string" || typeof child === "number") {
      return createTextElement(String(child));
    }

    // ✅ FIX: Preserve existing key or create a stable one
    if (typeof child === "object") {
      // If child already has a key, keep it
      if (child.key != null) {
        return child;
      }
      
      // Otherwise create a stable key
      const key = `${parentFiber.key || "root"}-${child.type?.name || child.type || "child"}-${index}`;
      return { ...child, key };
    }
    
    return child;
  });
}
/**
 * Updates a host component fiber (DOM element).
 * @param {Fiber} fiber - The host component fiber to update.
 */
function updateHostComponent(fiber: Fiber): void {
  if (!fiber.dom) fiber.dom = createDom(fiber);
  if(fiber?.props?.children)
   {
    const children = normalizeChildren(fiber.props.children, fiber);
  reconcileChildren(fiber, children);
   }
}

/**
 * Reconciles the children of a fiber with new elements.
 * @param {Fiber} wipFiber - The work-in-progress fiber.
 * @param {VNode[]} elements - The new child elements.
 */
function reconcileChildren(wipFiber: Fiber, elements: VNode[]) {
  let index = 0;
  let oldFiber = wipFiber.alternate?.child;
  let prevSibling: Fiber | null = null;

  // ✅ FIX: Build a map of existing fibers by key
  const existingFibers = new Map<string | number | null, Fiber>();
  let tempOldFiber = oldFiber;
  let tempIndex = 0;
  while (tempOldFiber) {
    const key = tempOldFiber.key ?? `index-${tempIndex}`;
    existingFibers.set(key, tempOldFiber);
    tempOldFiber = tempOldFiber.sibling;
    tempIndex++;
  }

  // ✅ FIX: Process each element in order
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    
    // Skip null/false/undefined (conditional rendering)
    if (element == null) {
      continue;
    }
    
    // ✅ FIX: Use the same key logic as when building the map
    const key = element.key ?? `index-${index}`;
    const oldFiber = existingFibers.get(key);
    
    const sameType = oldFiber && element.type === oldFiber.type;
    
    let newChildFiber: Fiber | null = null;
    
    if (sameType) {
      // ✅ FIX: Update existing fiber
      newChildFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
        key,
        ref: element.ref,
        hooks: oldFiber.hooks,
      };
      
      existingFibers.delete(key);
    } else {
      // Create new fiber
      newChildFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
        key,
        ref: element.ref,
      };
      
      // Mark old fiber for deletion if it exists
      if (oldFiber) {
        oldFiber.effectTag = "DELETION";
        deletions.push(oldFiber);
      }
    }
    
    // Link the new fiber into the tree
    if (newChildFiber) {
      if (index === 0) {
        wipFiber.child = newChildFiber;
      } else if (prevSibling) {
        prevSibling.sibling = newChildFiber;
      }
      prevSibling = newChildFiber;
      index++;
    }
  }
  
  // ✅ FIX: Mark any remaining old fibers for deletion
  existingFibers.forEach(fiber => {
    fiber.effectTag = "DELETION";
    deletions.push(fiber);
  });
}

/**
 * Creates a virtual DOM element.
 * @param {string|Function} type - The type of the element.
 * @param {object} props - The element's properties.
 * @param {...any} children - The element's children.
 * @returns {VNode} The created virtual DOM element.
 */
export function createElement(type: string | Function, props?: any, ...children: any[]): VNode {
  const rawChildren = children.flat().filter(c => c != null && typeof c !== "boolean");
  const normalizedChildren = rawChildren.map((child, i) => {
    if (typeof child === "object") return child;
    return createTextElement(String(child));
  });

  // Extract ref from props (if it exists)
  const ref = props?.ref;
  
  // Create a new props object without the ref
  const elementProps = { ...props };
  if ('ref' in elementProps) {
    delete elementProps.ref;
  }
  
  // Add children back
  elementProps.children = normalizedChildren;
  
  return {
    type,
    props: elementProps,
    key: props?.key ?? props?.id ?? null,
    // Store the ref separately on the VNode
    ref,
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

export function useStableRef<T>(initialValue: T | null = null): { current: T | null } {
  const ref = useRef(initialValue);
  
  // Use effect to ensure ref is cleaned up on unmount
  useEffect(() => {
    return () => {
      // Cleanup ref when component unmounts
      if (ref.current !== null) {
        ref.current = null;
      }
    };
  }, []);
  
  return ref;
}
/**
 * A React-like useState hook for managing component state.
 * @template T
 * @param {T|(() => T)} initial - The initial state value or initializer function.
 * @returns {[T, (action: T | ((prevState: T) => T)) => void]} A stateful value and a function to update it.
 */
 
export function useState<T>(initial: T | (() => T)): [T, (action: T | ((prevState: T) => T)) => void] {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  const currentHookIndex = hookIndex;
  const currentFiber = wipFiber; // Capture current fiber
  
  let hook = currentFiber.hooks[currentHookIndex]; 
  
  if (!hook) {
    hook = { 
      state: typeof initial === "function" ? (initial as () => T)() : initial,
      queue: [],
      _needsUpdate: false
    };
    currentFiber.hooks[currentHookIndex] = hook;
  }

  // Create setState that captures current hook and fiber
  const setState = (action: T | ((prevState: T) => T)) => {
    // Use setTimeout to ensure we're outside the current render cycle
    setTimeout(() => {
      // Re-find the hook in the current fiber (in case it moved)
      const fiber = currentRoot || wipRoot;
      if (!fiber) return;
      
      // Find the component fiber that owns this hook
      let targetFiber = findFiberWithHook(fiber, currentFiber, currentHookIndex);
      if (!targetFiber || !targetFiber.hooks) return;
      
      const targetHook = targetFiber.hooks[currentHookIndex];
      if (!targetHook) return;
      
      // Calculate new state
      const newState = typeof action === "function" 
        ? (action as (prevState: T) => T)(targetHook.state)
        : action;
      
      if (!Object.is(targetHook.state, newState)) {
        targetHook.state = newState;
        targetHook._needsUpdate = true;
        
        // Schedule a re-render
        scheduleRender();
      }
    }, 0);
  };

  hookIndex++;
  return [hook.state, setState];
}

// Helper to find the fiber containing a specific hook
function findFiberWithHook(root: Fiber, targetFiber: Fiber, hookIndex: number): Fiber | null {
  // Simple BFS to find the fiber
  let queue: Fiber[] = [root];
  
  while (queue.length > 0) {
    const fiber = queue.shift()!;
    
    // Check if this is our target fiber
    if (fiber === targetFiber || 
        (fiber.type === targetFiber.type && 
         fiber.key === targetFiber.key)) {
      return fiber;
    }
    
    // Add children to queue
    if (fiber.child) queue.push(fiber.child);
    if (fiber.sibling) queue.push(fiber.sibling);
  }
  
  return null;
}

/**
 * Schedules a re-render of the entire app
 */
function scheduleRender(): void {
  if (!currentRoot || !currentRoot.dom) return;
  
  // Schedule a new render starting from the current root
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
  
  // Start the work loop on next animation frame
  requestAnimationFrame(workLoop);
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
    // Schedule effect to run after render
    setTimeout(() => {
      if (hook._cleanupFn) {
        hook._cleanupFn();
      }
      const cleanup = callback();
      if (typeof cleanup === 'function') {
        hook._cleanupFn = cleanup;
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
 * Wraps a functional component into a VNode for Vader.js rendering.
 * @param {Function} fn - The function component to wrap.
 * @returns {Function} A function that creates a VNode when called with props.
 */
 export function component<P extends object>(
  fn: (props: P & { children?: any }) => VNode | VNode[]
): (props: P & { key?: string | number; children?: any }) => VNode {
  return (props: P & { key?: string | number; children?: any }) => {
    // Merge key if needed
    const { key, ...rest } = props;
    // Call the component function directly
    const vnode = fn(rest as P & { children?: any });

    // Attach the key to the VNode
    if (vnode && typeof vnode === "object") {
      vnode.key = key;
    }
    return vnode;
  };
}

export function  Show({ when, children }: { when: boolean, children: VNode[] }): VNode | null {
  return when ? children : null;
}
 
/**
 * For TypeScript to recognize your JSX factory, 
 * you often need the global namespace declaration as well:
 */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element {
      [key: string]: any;
    }
  }
}

/**
 * A React-like useRef hook for mutable references.
 * @template T
 * @param {T} initial - The initial reference value.
 * @returns {{current: T}} A mutable ref object.
 */
export function useRef<T>(initial: T | null = null): { current: T | null } {
  if (!wipFiber) {
    throw new Error("Hooks can only be called inside a Vader.js function component.");
  }

  let hook = wipFiber.hooks[hookIndex];
  if (!hook) {
    hook = { current: initial };
    wipFiber.hooks[hookIndex] = hook;
  }

  hookIndex++;
  return hook as { current: T | null };
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
      // Create a stable reference to the current ref value
      const currentRef = ref.current;
      console.log(currentRef)
      
      if (!currentRef || !event.target) {
        return;
      }

      console.log(currentRef)
      
      // Check if click is outside
      if (!currentRef.contains(event.target as Node)) {
        handler(event);
      }
    };
    
    // Use capture phase to ensure we catch the event
    document.addEventListener("mousedown", listener, true);
    
    return () => {
      document.removeEventListener("mousedown", listener, true);
    };
  }, [ref, handler]); // Keep ref in dependencies
}