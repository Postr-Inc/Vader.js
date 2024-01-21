import {Component, useState, strictMount, useRef}  from '/vader.js'

class Video extends Component{
    constructor(props){
        super(props)
        this.key = this.props?.key 
    }
    render(){ 
         
        let [/** @type {Boolean} */liked, setLiked] = this.useState('liked', false)
         
          
        
        let likedRef = this.useRef('likedRef', null)
        
        return  `
            <div class="card card-side    bg-base-100 border border-slate-200">
               
                <div class="  flex hero gap-5 p-2 ">
                <p class='bg-blue-500  rounded  p-12'>
                 
                </p>
                     <div class='flex flex-col text-sm  '>
                      <h2 class="card-title">${this.props?.title}</h2>
                       <p class='mt-2'>${this.props?.description}</p>
                        <svg 
                        ref="${likedRef.bind}",
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" 
                        class="${`w-6 h-6 cursor-pointer ${liked ? 'fill-error stroke-error' : ''}`}",
                        onClick="${this.bind(`setLiked(!liked, likedRef.bind); `, false, false, '9bhmzeuce0k', "setLiked,,liked,likedRef,event,", setLiked, liked, likedRef, event)}", usesEvent="true", eventType="onClick",data-ref="9bhmzeuce0k", 
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>

                      
                     </div>
                     
                </div>
            </div>
        `
    }
}
export class ComponentExample extends Component{
    constructor(props){
        super(props)
        this.key = this.props?.key
    }
    render(){ 
        let [/** @type {String} */search, setSearch] = this.useState('search', '')
         
          
      
        let [/** @type {Array} */videos, setVideos] = this.useState('videos', [
         
          
            {
                id: 45,
                title: 'Top 10 Movies of 2021',
                description: 'Video Description'
            },
            {
                id: 6,
                title: 'This is one of the best videos ever',
                description: 'Video Description'
            },
            {
                id: 12,
                title: 'My car is broken only javascript can fix it',
                description: 'Video Description'
            }
        ])
        
 

         
        let searchHook = this.useRef('searchHook', 'identifier')
        let searchInput = this.useRef('searchInput', null)
        let [/** @type {Boolean} */isSearching, setIsSearching] = this.useState('isSearching', false)
         
          

      
        async function filterVideos(e, test){
            setIsSearching(true, searchHook.bind)  
            setSearch(e.target.value, searchInput.bind) 
            let filtered = test.filter((video)=>{
                return video.title.toLowerCase().includes(e.target.value.toLowerCase())
            })  
            setVideos(filtered, searchHook.bind)
            setIsSearching(false, searchHook.bind) 
        }
        
        strictMount(this.key, ()=>{
            console.log(this.components)
        })
          
        return `
            <div  class="mockup-browser border border-base-300 xl:p-0   w-[350px] xl:w-[500px] ">
                <div class="mockup-browser-toolbar">
                    <div class="input border border-base-300">https://example.com/#/videos/3</div>
                </div>
                <div class=' p-5 flex flex-col gap-3'>
                    <h1 class='font-bold text-xl '>Vaderjs</h1>
                    <h1>
                        Example Component Videos
                    </h1>
                   
                
                    <input  
                    onInput="${this.bind(filterVideos, true, false, 'gw856tfwt4w', "e, test", event, videos)}", usesEvent="true", eventType="onInput",data-ref="gw856tfwt4w",       
                    type="text" class="input input-bordered rounded-full" placeholder="Search..." />
                </div>
                <h1   class='font-bold text-xl  mx-5 p-2' ref="${searchHook.bind}", >${videos.length} Videos</h1>
                <div class="flex flex-col justify-center gap-5  p-5  border-t border-base-300 h-96 ">
                 
                     
                    <div 
                    ref="${searchHook.bind}",
                    class="flex flex-col h-full  mt-5 overflow-y-scroll  mb-12 gap-5 scrollbar  ">
                        ${
                        videos.length > 0 && !isSearching ? videos.map((video, index)=>{
                            return `
                                ${this.memoize(this.createComponent(Video, {key:`${video.id}`, title:video.title, description:video.description}, [``,]))}
                            `
                        }).join('')  
                          :  isSearching ?  `
                            <div class='mx-auto flex justify-center'>
                                <span class='loading loading-spinner-large'></span>
                            </div>
                          ` : `
                           <p class='p-2'>
                                 No matches for <span class='font-bold'>${search}</span>
                           </p>
                            `
                        }
                    </div>
                    

                </div>
            </div>
        
        `
    }
    onMount(){
        console.log('Mounted')
    }
}


 //wascompiled