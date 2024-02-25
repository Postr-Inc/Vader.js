//@ts-nocheck
declare namespace Vader{
    export let useState: <T>(initialState: T) => [T, (newState: T) => void];
    export let useReducer: <T>(reducer: (state: T, action: any) => T, initialState: T) => [T, (newState: T) => void];
    export const useRef: <T>(initialValue: T | null) => { current: T | null };
    export const Mounted: (fn: () => void) => void;
} 
declare global {
    /**
     * @type {boolean}
     * @description A boolean value that returns true if the current environment is a server
     */
    const isServer: boolean
    /**
     * @type {boolean}
     * @description Default(true) - A boolean value that lets you opt out of prerendering (Only applies towards using the vaderjs serverside )
     */
    var preRender: boolean
 
   
       /**
     * @description HTMLTextNode is a global interface that represents a text node
     */

    interface HTMLTextNode {
        nodeValue: string;
        nodeType: number;
        tagName: string;
        props:{nodeValue: string};
        toString: () => string; 
        insertBefore: (child: HTMLTextNode, ref: HTMLTextNode) => void;
    }
       /**
     * @description HTMLElement is a global interface that represents an HTML element
     */
    interface HTMLElement{
        tagName: string;
        id: string; 
        nodeType: number;
        classList:{
            add: (className: string) => void;
            remove: (className: string) => void;
            toggle: (className: string) => void;
            contains: (className: string) => boolean;
        }
        props: {
            [key: string]: string;
        }
        children: HTMLElement[];
        outerHTML: string;
        innerHTML: string; 
        textContent: string;
        firstChild: HTMLElement | HTMLTextNode | null;
        style?: {
            
            display: string;
            position: string;
            top: string;
            left: string;
            right: string;
            bottom: string;
            width: string;
            height: string;
            maxWidth: string;
            maxHeight: string;
            minWidth: string;
            minHeight: string; 
            margin: string;
            marginTop: string;
            marginRight: string;
            marginBottom: string;
            marginLeft: string; 
            padding: string; 
            paddingTop: string;
            paddingRight: string;
            paddingBottom: string;
            paddingLeft: string; 
            overflow: string;
            zIndex: string;
            cursor: string;
            textAlign: string;
            fontSize: string;
            fontWeight: string;
            fontStyle: string;
            textDecoration: string;
            lineHeight: string;
            letterSpacing: string;
            textTransform: string;
            backgroundColor: string;
            backgroundImage: string;
            backgroundSize: string;
            backgroundPosition: string;
            backgroundRepeat: string;
            backgroundAttachment: string;
            backgroundClip: string;
            backgroundOrigin: string;
            backgroundBlendMode: string;
            boxShadow: string;
            transition: string;
            transform: string;
            transformOrigin: string;
            transformStyle: string;
            perspective: string;
            perspectiveOrigin: string;
            backfaceVisibility: string;
            filter: string;
            backdropFilter: string;
            mixBlendMode: string;
            border: string;
            borderTop: string;
            borderRight: string;
            borderBottom: string;
            borderLeft: string;
            borderStyle: string;
            borderTopStyle: string;
            borderRightStyle: string;
            borderBottomStyle: string;
            borderLeftStyle: string;
            borderColor: string;
            borderTopColor: string;
            borderRightColor: string;
            borderBottomColor: string;
            borderLeftColor: string;
            borderRadius: string;
            borderTopLeftRadius: string;
            borderTopRightRadius: string;
            borderBottomRightRadius: string;
            borderBottomLeftRadius: string;
            borderWidth: string;
            borderTopWidth: string;
            borderRightWidth: string;
            borderBottomWidth: string;
            borderLeftWidth: string; 
            
            [key: string]: string;
        } 
        attributes: {
            [key: string]: string;
        };
        events: [];
        toString: () => string;
        getAttribute: (attr: string) => string | null; 
        appendChild: (child: HTMLElement) => void;
        prepend: (child: HTMLElement) => void;
        append: (...child: HTMLElement[]) => void;
        insertBefore: (node1: HTMLElement, node2: HTMLElement) => void;
        removeChild: (child: HTMLElement) => void;
        querySelector: (selector: string) => HTMLElement | null;
        querySelectorAll: (selector: string) => HTMLElement[]; 
    }
} 
interface LastModified {
    date: string;
    time: string;
    parsed: string;
}
 /**
     * @type {Object}
     * @description The file object
     * @property {string} name - The name of the file
     * @property {string} filetype - The type of the file
     * @property {string} dataUrl - The data url of the file
     * @property {string} text - The text content of the file
     * @property {string} fileUrl - The file url
     * @property {number} filesize - The file size
     * @property {Blob} blob - The file blob
     * @property {LastModified} lastModified - The last modified date
     * @property {string} mimetype - The file mimetype
     */
interface File {
    name: string;
    filetype: string;
    dataUrl: string;
    fileUrl: string;
    filesize: number;
    lastModified: LastModified;
    mimetype: string;
}

/**
 * @description Returns a stateful value, and a function to update it.
 * @template T
 * @param {T} initialState - The initial state value.
 * @returns {[T, (newState: T) => void]} - A tuple containing the current state value and a function to update the state.
 * @see https://react.dev/reference/react/useState
 */

declare const useState: <T>(initialState: T) => [T, (newState: T) => void];

 /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     * 
     * @see https://react.dev/reference/react/useReducer
     */

declare const useReducer: <T>(reducer: (state: T, action: any) => T, initialState: T) => [T, (newState: T) => void];
 /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     * 
     * @see https://react.dev/reference/react/useRef
     */
 declare const useRef: <T>(initialValue: T | null) => { 
    current: T extends null ? HTMLElement : T;
}; 

 /**
     * Accepts a function that contains imperative, possibly effectful code.
     *
     * @param {Function} fn Imperative function that can  be ran once the component is mounted - (does not apply when running on the server)
     * @returns {void}
     */

declare function Mounted(fn: Function): void; 
export { useState, useReducer, useRef, useFile, Mounted, require }



 