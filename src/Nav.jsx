let { Component } = await import('./vader.js')

class Nav extends Component {
    constructor(props) {
        super(props) 
    }
    render() {
        return `
            <div class="navbar bg-base-100 ">
                <div class="flex-1  ">
                    <img src="https://raw.githubusercontent.com/Postr-Inc/Vader.js/main/logo.png" class="w-12 h-12" />
                    <a class="  text-2xl mx-2  font-bold ">Vader.js</a>
                     
                </div>
                <div class="flex-none">
                    <button class="btn btn-square btn-ghost">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                    </button>
                </div>
            </div>
        `
    }
}

return { Nav }

//wascompiled

 //wascompiled