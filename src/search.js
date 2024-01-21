import { Component, strictMount, useReducer } from '/dist/vader.js'

let data = await fetch('src/searchData/search.json').then(res => res.json())
 

import { Button } from './button.js'

export class SearchBar extends Component {
    constructor(props) {
        super(props)
        this.key = props?.key
    }
    render() {
        function search(e, json) {
            console.log(e, json)
        }
        let [state, dispatch] = this.useReducer('state', function (state, action) {
            switch (action.type) {
                case 'search':
                    return { ...state, search: action.payload }
                default:
                    return state
            }
        }, { data: data })
        return `
            <div class='xl:flex lg:flex md:flex hidden'>
                <div
                    onClick="${this.bind(`document.getElementById('my_modal_5').showModal(); `, false, false, '5yacfob8mkg', "", null)}", usesEvent="true", eventType="onClick",data-ref="5yacfob8mkg", 
                     
                    class=' flex hero gap-2 rounded-box   input-sm      hover:bg-base-200  text-sm focus:outline-none border-slate-200 border' type='text'


                ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                    Search Documentation</div>
            </div>
            <div onClick="${this.bind(`document.getElementById('my_modal_5').showModal(); `, false, false, 'hvd33h7hfgt', "", null)}", usesEvent="true", eventType="onClick",data-ref="hvd33h7hfgt", 
                class='xl:hidden lg:hidden md:hidden'>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>

            </div>

            <dialog id="my_modal_5" class="modal modal-bottom sm:modal-middle">
                <div class="modal-box">
                    <h3 class="font-bold text-lg">Hello!</h3>
                    <p class="py-4">Press ESC key or click the button below to close</p>
                    <div class="modal-action">
                        <form method="dialog">

                            <button class="btn">Close</button>
                        </form>
                    </div>
                </div>
            </dialog>

        `
    }
}

export class Search extends Component {
    constructor(props) {
        super(props)
    }
    render() {
        return `
            <input
                class='input p-2 rounded-full'
                style="${this.parseStyle({ padding: '.5rem', borderRadius: '2px', width: '100%', borderRadius: '.5rem', borderColor: 'var(--fallback-b2,oklch(var(--b2)/var(--tw-border-opacity)))', border: '1px solid', display: 'flex', gap: '0.5rem', alignItems: 'center', margin: 'auto', justifyContent: 'center', cursor: 'pointer' })}",
                type="text" placeholder="Search.." name="search" />
        `
    }
}

 //wascompiled