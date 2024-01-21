let { Component, useState } = await import(Vader.root + '//vader.js')
let { Nav } = await import(Vader.root + '/src/Nav.js') 
let { Home } = await import(Vader.root + '/src/pages/docs/overview/index.js')
  
window.Vader['docs'] = {
    'overview': {
        lastUpdated: '1/17/23'
    },
    'installation': {
        lastUpdated: '1/17/23'
    },
}
class Index extends Component {
    constructor(props) {
        super(props)
        this.key = 'index'
        
    }

    render() {

        let p = this.request.query.page ? `/docs/${this.request.query.page}` : '/docs/getting-started'
        this.request.query.subpage ? p = p + '/' + this.request.query.subpage : ''

        let [/** @type {*} */path, setPath] = this.useState('path', p)
         
          

        
 
        return `
            <div key="${this.key}", class='xl:px-64 md:px-64 lg:px-32'>
                <div class='  fixed top-0 left-0 xl:px-64 lg:px-32  w-full bg-white z-[9999]  '>
                    ${this.memoize(this.createComponent(Nav, {key:'docs_nav', path:p}, [``,]))}

                    <ul class="menu   z-[999] bg-white  bg-opacity-90 xl:hidden lg:hidden border border-base-200  ">
                        <li>
                            <details >
                                <summary class='focus:bg-none pointer-events-auto focus:bg-transparent hover:bg-transparent' >Menu</summary>

                                <li><a
                                    class='font-semibold'
                                    onClick="${this.bind(`this.response.setQuery({ page: 'getting-started' }); `, false, false, '7e9ft6xt9zw', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="7e9ft6xt9zw", 
                                >Getting Started</a></li>
                                <li class='p-1'><a
                                    class="${`
           ${path == '/docs/getting-started/installation' ? 'font-semibold text-blue-500 font-sans' : ''
                                        }
         `}",
                                    onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'installation' }); `, false, false, 't6nuo93rhdg', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="t6nuo93rhdg", 
                                >Installation</a></li>
                                <li class='p-1'><a
                                    class="${`
           cursor-pointer
           ${path == '/docs/getting-started/project-structure' ? 'font-semibold  text-blue-500 font-sans' : ''
                                        }
         `}",
                                    onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'project-structure' }); `, false, false, 'cs717gicbe4', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="cs717gicbe4", 
                                >Project Structure</a></li>
                                
                                <li class="p-1">

                                    <a
                                        class="${`${path == '/docs/getting-started/routing' ? 'font-semibold text-blue-500 font-sans' : ''}`}",
                                        onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'routing' }); `, false, false, 'tylzvx3x4a', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="tylzvx3x4a", 
                                    >Routing</a></li>
                                <li class="p-1">

<a
    class="${`${path == '/docs/getting-started/deployment' ? 'font-semibold text-blue-500 font-sans' : ''}`}",
    onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'deployment' }); `, false, false, 'j6191rzrjgk', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="j6191rzrjgk", 
>Deployment</a></li> 
  
                                    

                            </details>
                        </li>

                    </ul>
                </div>


                <div class="drawer relative xl:drawer-open  mt-[6.5rem] lg:mt-[3.8rem] md:mt-[3.8rem] p-5 xl:p-0 lg:p-0 md:p-0 w-full">
                    <input id="my-drawer" type="checkbox" class="drawer-toggle" />

                    <div
                        class="drawer-content   xl:p-[.5rem]    xl:pl-[10rem] lg:pl-[15rem]  xl:mx-auto xl:justify-center xl:flex xl:w-[50vw] lg:w-[70vw]  ">

                        ${
                            path === '/docs/getting-started' || path === '/docs/getting-started/installation' || path === '/docs/getting-started/project-structure'
                                || path === '/docs/getting-started/routing' || path === '/docs/getting-started/deployment' 
                                ? `
                                    ${this.memoize(this.createComponent(Home, {key:'home', page:path, click:function(path,subpath,){console.log(path); this.response.setQuery({ page: path, subpage: subpath }); }.bind(this)}, [``,]))}
                                `
                                : path === '/docs/api/hooks' ? `
                                    ${this.memoize(this.createComponent(Hooks, {key:'hooks', page:path, click:function(path,){setPath(path);}.bind(this)}, [``,]))}
                                `

                                    : ``
                        }

                    </div>

                    <div class="   xl:block   lg:block hidden">


                        <ul class='p-5     fixed    flex flex-col text-sm gap-5'>
                            <li
                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started' }); `, false, false, 'gunqq3kan57', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="gunqq3kan57", 
                                class='cursor-pointer'
                            >
                                <a class='flex gap-2 hero'>
                                    <div


                                        class="${`cursor-pointer ${path.includes('getting-started') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}`}",


                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
                                        </svg>

                                    </div>
                                    Getting Started
                                </a>
                            </li>
                            <li
                             
                            >
                                <a
                                    class='flex gap-2 hero'
                                > <div class="${` ${path.includes('guide') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}`}",>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                        </svg>


                                    </div>
                                    Guide
                                </a>
                            </li>
                            <li>
                                <a
                                    class='flex gap-2 hero'
                                > <div class="${`
                                ${path.includes('api') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}
                                `}",>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                                        </svg>



                                    </div>
                                    Api
                                </a>
                            </li>
                            <li>
                                <a
                                    class='flex gap-2 hero'
                                > <div class="${`
                                ${path.includes('api') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}
                                `}",>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                                        </svg>




                                    </div>
                                    Examples
                                </a>
                            </li>
                            <hr></hr>
                            ${
                                path.includes('getting-started') ? `
                                    <li
                                        onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'installation' }); `, false, false, 'xxmioatfrfb', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="xxmioatfrfb", 
                                        class='cursor-pointer'
                                    >
                                        <a

                                            class='flex gap-2 hero'>
                                            <div class="${`
                                ${path.includes('installation') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}
                                `}",

                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                                </svg>

                                            </div>
                                            Installation
                                        </a>
                                    </li>
                                    <li
                                        onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'project-structure' }); `, false, false, 'fs48mk0m2fo', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="fs48mk0m2fo", 
                                        class='cursor-pointer'
                                    >
                                        <a class='flex gap-2 hero'>
                                            <div class="${`${path.includes('project-structure') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}`}",>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                                                </svg>


                                            </div>
                                            Project Structure
                                        </a>
                                    </li>
                                    <li
                                        onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'routing' }); `, false, false, 'yfzkf135nd', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="yfzkf135nd", 
                                        class='cursor-pointer'
                                    >
                                        <a class='flex gap-2 hero'>
                                            <div class="${`${path.includes('routing') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}`}",>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 8.25h15m-16.5 7.5h15m-1.8-13.5-3.9 19.5m-2.1-19.5-3.9 19.5" />
                                                </svg>



                                            </div>

                                            Routing
                                        </a>
                                    </li>
                                    <li
                                        onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'deployment' }); `, false, false, '0mvl52irugjq', "setPath,", setPath)}", usesEvent="true", eventType="onClick",data-ref="0mvl52irugjq", 
                                        class='cursor-pointer'
                                    >
                                        <a class='flex gap-2 hero'>
                                            <div class="${`${path.includes('deployment') ? 'p-1 rounded text-white bg-blue-500' : 'p-1 rounded   bg-base-200 border'}`}",>
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-4 h-4">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                                                </svg>


                                            </div>

                                            Deployment
                                        </a>
                                    </li>
                                   
                                ` : ``
                            }
                        </ul>

                    </div>

                </div>
            </div>

        `
    }

}
 
export default Index

 //wascompiled
