let { Component, useState } = await import('./vader.js')
let { Home } = await require('./src/pages/docs/overview/index.jsx')
let { Hooks } = await require('./src/pages/docs/hooks/index.jsx')
let { Nav } = await require('./src/nav.jsx')
let { Collapse } = await require('./src/collapse.jsx')

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
        let p = `/docs/${this.request.query.page + '/' + this.request.query.subpage || 'getting-started'}`
        console.log(p)
        let [path, setPath] = this.useState('path', p)
         
          


        return `
            <div key="${this.key}", class='xl:px-24 lg:px-24'>
                ${this.memoize(this.createComponent(Nav, {key:'docs_nav',}, [``,]))}
                <ul class="menu sticky top-0  z-[999] bg-white  bg-opacity-90 xl:hidden lg:hidden border border-base-200  ">
                    <li>
                        <details >
                            <summary class='focus:bg-none pointer-events-auto focus:bg-transparent hover:bg-transparent' >Menu</summary>

                            <li><a
                                class='font-semibold'
                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started' }); `, false, '2y61il2fpc5', "setPath,", setPath)}",
                            >Getting Started</a></li>
                            <li class='p-1'><a
                                class="${`
          ${path == '/docs/getting-started/installation' ? 'font-semibold text-blue-500 font-sans' : ''
                                    }
        `}",
                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'installation' }); `, false, 'dzhss83ofab', "setPath,", setPath)}",
                            >Installation</a></li>
                            <li class='p-1'><a
                                class="${`
          cursor-pointer
          ${path == '/docs/getting-started/structure' ? 'font-semibold  text-blue-500 font-sans' : ''
                                    }
        `}",
                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'structure' }); `, false, '6pgl0ofape', "setPath,", setPath)}",
                            >Project Structure</a></li>


                        </details>
                    </li>

                </ul>
                <div class="drawer xl:drawer-open">
                    <input id="my-drawer" type="checkbox" class="drawer-toggle" />
                    <div
                        class="drawer-content xl:mx-24  xl:p-[.5rem] p-5  xl:pl-[10rem]  xl:w-[50vw]">
                        ${
                            path.includes('getting-started') ? `
                                ${this.memoize(this.createComponent(Home, {key:'home', page:path, click:function(path,subpath,){console.log(path); this.response.setQuery({ page: path, subpage: subpath }); }.bind(this)}, [``,]))}
                            `
                                : path.includes('/docs/hooks') ? `
                                    ${this.memoize(this.createComponent(Hooks, {key:'hooks', page:path, click:function(path,){setPath(path);}.bind(this)}, [``,]))}
                                `
                                    : ""
                        }

                    </div>
                    <div class="drawer-side ">
                        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>

                        <ul class='p-5 sticky top-0 flex flex-col text-sm gap-5'>
                            <li
                                class="${`
                           ${path == '/docs/getting-started' ? 'font-semibold text-blue-500 font-sans' : ''}
                        `}",
                            >
                                <p
                                    onClick="${this.bind(`this.response.setQuery({ page: 'getting-started' }); `, false, 'uj4es6mpwlr', "setPath,", setPath)}",
                                    class='font-semibold cursor-pointer'>Getting Started</p>
                            </li>
                            <li

                                class="${`
                        p-1
                        gap-5  hero flex  cursor-pointer
                         ${path == '/docs/getting-started/installation' ? 'font-semibold text-blue-500 font-sans' : ''}
                        `}",
                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'installation' }); `, false, 'bmopbjivkak', "setPath,", setPath)}",
                            >


                                Installation
                            </li>
                            <li
                                class="${`
                        cursor-pointer
                     p-1
                        flex   gap-5
                         ${path == '/docs/getting-started/structure' ? 'font-semibold text-blue-500 font-sans' : ''}
                        `}",

                                onClick="${this.bind(`this.response.setQuery({ page: 'getting-started', subpage: 'structure' }); `, false, 'bp09yukz3tt', "setPath,", setPath)}",
                            >
                                Project Structure
                            </li>
                        </ul>

                    </div>
                </div>
            </div>

        `
    }

}

return { default: Index }

 //wascompiled