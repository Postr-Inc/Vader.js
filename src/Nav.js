let { Component } = await import(Vader.root + '//vader.js')
let {SearchBar} = await import(Vader.root + '/src/search.js') 
export class Nav extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return `
            <div class="navbar  sticky top-0 z-[9999]    bg-white ">
                <div class="navbar-start"
                    onClick="${this.bind(`this.response.redirect('/'); `, false, false, 's7eifr793j', "", null)}", usesEvent="true", eventType="onClick",data-ref="s7eifr793j", 
                >

                    <img
                    alt='vader-logo'
                    src="https://raw.githubusercontent.com/Postr-Inc/Vader.js/main/logo.png" class="w-12 cursor-pointer h-12" />
                    <a class="  text-2xl mx-2  font-bold ">Vader.js</a>
                </div>
                
                
                
                 
                <div class="navbar-end ">
                 
                ${this.memoize(this.createComponent(SearchBar, {key:'searchbar',}, [``,]))}
               
                
                <div class="dropdown dropdown-left z-[9999]">
                    <div tabIndex="${0}", role="button" class="btn btn-ghost lg:hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
                    </div>
                    <ul tabIndex="${0}", class="menu menu-sm  z-[9999]   dropdown-content mt-3   bg-white p-2 shadow  rounded-box w-52">
                        <li><a>Item 1</a></li>
                        <li>
                            <a>Parent</a>
                            <ul class="p-2">
                                <li><a>Submenu 1</a></li>
                                <li><a>Submenu 2</a></li>
                            </ul>
                        </li>
                        <li><a>Item 3</a></li>
                    </ul>
                </div>
                </div>
                
            </div>

        `
    }
}

 



 //wascompiled