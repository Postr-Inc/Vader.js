const { strictMount } = await import("./vader.js");

let { Component, require, useState } = await import("./vader.js");
let { Button } = await require("./src/button.jsx");
let { Nav } = await require("./src/nav.jsx");
let { ComponentExample } = await require("./src/examples/component.jsx");
let { CodeBlock } = await require("./src/codeblock.jsx");
class Index extends Component {
    constructor(props) {
        super(props);
        this.key = 'index'
    }
    render() {

        let [view, setView] = this.useState('view', 'index')
         
          
        let [loaded, setLoaded] = this.useState('loaded', false)
         
          
        let embedref = this.useRef('embedref', null)
        return `
            <div key="${this.key}", class="xl:px-24 lg:px-24">
                ${this.memoize(this.createComponent(Nav, {key:1}, [``,]))}
                <div class="p-2 "  >
                    <div class="mt-5 flex flex-col w-full justify-center mx-auto xl:w-[50vw] lg:w-[60vw] md:w-[60vw] ">

                        <h1
                            class="mb-5 mt-5 xl:text-6xl  font-bold  text-4xl w-full   font-sans text-clip text-center   
            text-black antialiased break-words capitalize drop-shadow-lg"
                        >
                            The future of spa web${" "}
                            <span class="text-blue-500">development</span> is here
                        </h1>

                        <p class="text-center text-md p-2">
                            Vaderjs  is a lightweight framework for building websites with a focus on simplicity and speed.
                        </p>

                        <div class="flex gap-5 mt-16 w-fit mx-auto justify-center">
                            ${this.memoize(this.createComponent(Button, {key:2, class:'btn border bg-blue-500 hover:bg-blue-500 text-white h-fit flex mx-auto justify-center w-fit border-slate-200 ', redirect:'/docs/?page=getting-started',}, [` <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-6 h-6" > <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /> </svg> <p> Get Started</p>`,]))}
                            <div class="flex flex-col">
                                <div class="bg-slate-900 btn    text-white pointer-events-none  rounded w-42 sm:w-50 sm:text-sm flex gap-2">
                                    <p>&gt; npx vaderjs --build</p>
                                    <svg
                                        class="w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    >

                                        <rect
                                            x="9"
                                            y="9"
                                            width="13"
                                            height="13"
                                            rx="2"
                                            ry="2"
                                        ></rect>{" "}
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>{" "}
                                    </svg>
                                </div>
                                <span class="badge  badge-neutral  text-white rounded mx-auto justify-center align-center mt-2">

                                    Version ${Vader.version}
                                </span>
                            </div>
                        </div>
                        
                        <div class="text-center mx-auto  mt-24 justify-center flex flex-col  gap-5">
                            <h1 class="font-bold  xl:w-[36vw]  lg:w-[36vw]  mt-12 text-4xl">Create Interactive Webapps from Components</h1>
                            <p>
                                Vader allows you to add seamless reactivity through its component system.
                            </p>
                        </div>

                        <button
                            class="btn btn-ghost  shadow border-slate-200 border  hover:bg-white btn-sm w-fit text-center align-middle mx-auto mt-5"
                            onClick="${this.bind(`setView(view === 'index' ? 'stackblitz' : 'index'); console.log(view); `, false, 'jqz7b0qltks', "setView,view,embedref,", setView, view, embedref)}",
                        >
                            ${
                                view === 'index' ? 'Click to View Code' : 'Click to View Example Component'
                            }
                        </button>
                        <div
                            ref="${embedref.bind}",
                            class="${`mt-16 mb-16 flex xl:mx-auto xl:justify-center  md:mx-auto md:justify-center ${view !== "index" ? "p-5" : ""}   `}",>


                            ${
                                view == 'index' ? `
                                    ${this.memoize(this.createComponent(ComponentExample, {key:3}, [``,]))}
                                `
                                    : `
                                        <embed
                                            ref="${embedref.bind}",
                                            onLoad="${this.bind(``, false, '3yu40bwfm1k', "setLoaded,loaded,", setLoaded, loaded)}",
                                            class="h-[600px] w-[600px] rounded  "
                                            src="https://stackblitz.com/edit/web-platform-aanbgw?file=dev%2Fpages%2Findex.jsx&view=editor"
                                            style={{ width: '100%', height: '100%' }}
                                        />
                                    `

                            }


                        </div>

                    </div>

                </div>
            </div>

        `

    }
}

return { default: Index }; // export index component


 //wascompiled
