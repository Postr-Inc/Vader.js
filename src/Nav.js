import{Component as n}from"/vader.js";import{SearchBar as e}from"/src/search.js";export class Nav extends n{constructor(n){super(n)}render(){return`\n            <div class="navbar  sticky top-0 z-[9999]    bg-white ">\n                <div class="navbar-start"\n                    onClick="${this.bind("this.response.redirect('/'); ",!1,!1,"d6snoe0hs8u","",null)}", usesEvent="true", eventType="onClick",data-ref="d6snoe0hs8u", \n                >\n\n                    <img\n                    alt='vader-logo'\n                    src="https://raw.githubusercontent.com/Postr-Inc/Vader.js/main/logo.png" class="w-12 cursor-pointer h-12" />\n                    <a class="  text-2xl mx-2  font-bold ">Vader.js</a>\n                </div>\n                \n                \n                \n                 \n                <div class="navbar-end ">\n                 \n                ${this.memoize(this.createComponent(e,{key:"searchbar"},[""]))}\n               \n                \n                <div class="dropdown dropdown-left z-[9999]">\n                    <div tabIndex="0", role="button" class="btn btn-ghost lg:hidden">\n                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>\n                    </div>\n                    <ul tabIndex="0", class="menu menu-sm  z-[9999]   dropdown-content mt-3   bg-white p-2 shadow  rounded-box w-52">\n                        <li><a>Item 1</a></li>\n                        <li>\n                            <a>Parent</a>\n                            <ul class="p-2">\n                                <li><a>Submenu 1</a></li>\n                                <li><a>Submenu 2</a></li>\n                            </ul>\n                        </li>\n                        <li><a>Item 3</a></li>\n                    </ul>\n                </div>\n                </div>\n                \n            </div>\n\n        `}}