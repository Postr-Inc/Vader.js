import { Component, useRef, useState } from '/dist/vader.js'

export class Routing extends Component {
  constructor(props) {
    super(props)
    this.key = props?.key
  }

  render() {
    let copiedRef = this.useRef('copiedRef', null)

    let [/** @type {Boolean} */saved, setSaved] = this.useState('saved', false)
         
          
    return `
      <div class='relative flex flex-col gap-5'>
        <div class="text-sm breadcrumbs">
          <ul>
            <li><a class='no-underline'
              onClick="${this.bind(`this.props?.swapPage({ page: 'getting-started', subpage: '' }); `, false, false, 'woc25hpmcd', "", null)}", usesEvent="true", eventType="onClick",data-ref="woc25hpmcd", 
            >Getting Started</a></li>
            <li><a class='font-semibold'>Routing</a></li>
          </ul>
        </div>
        <h2 class='text-4xl font-bold'>Routing</h2>
        <p>Vaders filesystem router creates routes automatically for every file in the /pages directory </p>
        <hr></hr>
        <p class='mt-2'>
          One main feature of vader is the ability to define routes based on folder structure. Each jsx file within a folder in the pages directory

          symbolizes an endpoint. When a user visits the route they will be served with the contents of the jsx file.
        </p>
      </div>
      <div class='relative flex flex-col gap-5 mt-12'>
        <h2 class='text-2xl font-bold'>Pages</h2>
        <p>
          Vaderjs uses a filesystem routing system. That automatically compiles code from the pages directory and appends the route in the main app.js file, based on the file structure.
          <a onClick="${this.bind(`this.props?.swapPage({ page: 'getting-started', subpage: 'project-structure' }); `, false, false, 'g41erj0ibwk', "", null)}", usesEvent="true", eventType="onClick",data-ref="g41erj0ibwk",  class='text-blue-500 cursor-pointer hover:underline'>Learn more about project structure</a>
        </p>
        <ul class="menu  border border-slate-200 rounded" aria-label='file structure example' title='file structure example'>
          <li><a>index.jsx - <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com#/</span></a></li>
          <li>
            <details open>
              <summary>pages/home <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com#/home</span></summary>
              <ul>
                <li><a><svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                  <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />
                  <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />
                </svg>index.jsx</a></li>
                <li>
                  <details open>
                    <summary>site</summary>
                    <ul>
                      <li><a><svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                        <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />
                        <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />
                      </svg>[id].jsx <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com#/home/:site</span></a></li>
                    </ul>
                  </details>
                </li>
              </ul>
            </details>
          </li>
        </ul>

      </div>
      <div class='relative flex flex-col gap-5 mt-12'>
        <h2 class='text-2xl font-bold'>Route Methods</h2>
        <p>
          Each component has access to route methods directly from <span class='badge'>this.request</span> or <span class='badge'>this.response</span> objects. You are able to derive properties, query params
          as well as swapping routes, setting query parameters and much more.
        </p>
        <div class="relative bg-base-100 border text-sm border-slate-200 rounded">
          <div class='flex gap-5 hero   p-4'>
            <svg
              class='w-8 h-8 rounded'
              xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="100" height="100" viewBox="0 0 48 48">
              <path fill="#ffd600" d="M6,42V6h36v36H6z"></path><path fill="#000001" d="M29.538 32.947c.692 1.124 1.444 2.201 3.037 2.201 1.338 0 2.04-.665 2.04-1.585 0-1.101-.726-1.492-2.198-2.133l-.807-.344c-2.329-.988-3.878-2.226-3.878-4.841 0-2.41 1.845-4.244 4.728-4.244 2.053 0 3.528.711 4.592 2.573l-2.514 1.607c-.553-.988-1.151-1.377-2.078-1.377-.946 0-1.545.597-1.545 1.377 0 .964.6 1.354 1.985 1.951l.807.344C36.452 29.645 38 30.839 38 33.523 38 36.415 35.716 38 32.65 38c-2.999 0-4.702-1.505-5.65-3.368L29.538 32.947zM17.952 33.029c.506.906 1.275 1.603 2.381 1.603 1.058 0 1.667-.418 1.667-2.043V22h3.333v11.101c0 3.367-1.953 4.899-4.805 4.899-2.577 0-4.437-1.746-5.195-3.368L17.952 33.029z"></path>
            </svg>
            <div class="absolute end-5 z-[9999]"

              onClick="${this.bind(`setSaved(true, copiedRef.bind); `, false, false, '2q49bvj1uu2', "setSaved,saved,copiedRef,", setSaved, saved, copiedRef)}", usesEvent="true", eventType="onClick",data-ref="2q49bvj1uu2", 
            >
              <div
                ref="${copiedRef.bind}",
                class='hover:bg-base-200 px-[.4rem] py-[.4rem] rounded'>
                ${
                  saved ? `
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="${1.5}", stroke="currentColor" class="  stroke-green-500  w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>

                  `
                    : `
                      <svg class="${`  cursor-pointer`}", data-testid="geist-icon" fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: currentcolor; width: 20px; height: 20px;"><path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z"></path></svg>
                    `
                }



              </div>
            </div>
            app.js

          </div>

          <div class="flex gap-3 py-5 px-5 border-t border-base-300">
            <ul class='p-1 flex   gap-4'>
              <div class='flex flex-col  '>
                <span class='opacity-60'>1</span>
                <span class='opacity-60'>2</span>
                <span class='opacity-60'>3</span>
                <span class='opacity-60'>4</span>
                <span class='opacity-60'>5</span>
                <span class='opacity-60'>6</span>
                <span class='opacity-60'>7</span>
                <span class='opacity-60'>8</span>
                <span class='opacity-60'>9</span>
                <span class='opacity-60'>10</span>
                <span class='opacity-60'>11</span>
                <span class='opacity-60'>12</span>
              </div>
              <div class='flex flex-col'>
              <li>
              this.request  = ${'{'}
 
               
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
              headers:<span class='text-yellow-800'>{},</span>
              </span>
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
                path: <span class='text-yellow-800'>"/",</span>
              </span>
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
              params: <span class='text-yellow-800'>{},</span>
              </span>
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
              query: <span class='text-yellow-800'>{},</span>
              </span>
              </li>
              <li>
              <span  >
               ${'}'}
              </span>
              </li>
              <li>
              this.response = ${'{'}
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
                send: <span class='text-yellow-800'>(data)=&gt;${'{}'}</span>,
                 
              </span>
              </li>
              <li>
              <span class='mx-2 text-purple-700'>
                json: <span class='text-yellow-800'>(data)=&gt${'{}'}</span>,
                
                </span>
              </li>
                 <li>
                 <span class='mx-2 text-purple-700'>
                redirect: <span class='text-yellow-800'>(path)=&gt${'{}'}</span>,
                 
                </span>
                 </li>
                 <li>
                  <span class='mx-2 text-purple-700'>
                    refresh: <span class='text-yellow-800'>()=&gt${'{}'}</span>,
                    </span>
                 </li>
                 <li>
                 <span class='mx-2 text-purple-700'>
                setQuery: <span class='text-yellow-800'>(obj)=&gt${'{}'}</span>,
                </span>
                 </li>
                 <li>
                  <span class='mx-2 text-purple-700'>
                ${'}'}
                 </span>
                 </li>
                 
              </div>
            </ul>

          </div>

        </div>
      
        <h2 class='text-2xl font-bold'>Route Middlewares</h2>
        <p>
          Route middlewares can be defined by using the <span class='badge'>this.router.use</span> method. This method takes in a function that will be executed before the route is rendered, allowing you to perform any logic beforehand.
        </p>
        <div class="bg-base-200 p-5 gap-5 flex flex-col  text-start align-baseline rounded border-l-red-500 border-l-[5px] ">
         <div>
         <p>
            <span class='font-semibold'>Note:</span>
          </p> 
         </div>
        <p>
                 You can only have one middleware per route, Incase you want to pause the route to render something else you can use the <span class='badge'>req.pause = true</span> method.
                 <br></br>
                 This enables you to be able to render loading ui's or  binding conditional statements before allowing access to the route.
              </p>
        </div>
        <div class="relative bg-base-100 border text-sm border-slate-200 rounded">
            <div class='flex gap-5 hero   p-4'>
              <svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
                <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />
                <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />
              </svg>
              <div class="absolute end-5"
                ref="${copiedRef.bind}",
                onClick="${this.bind(`navigator.clipboard.writeText(examples['1']); setSaved(!saved, copiedRef.bind); setTimeout(() => {; setSaved(false, copiedRef.bind); }, 1000); `, false, false, '8as3cf5txk9', "setSaved,saved,copiedRef,", setSaved, saved, copiedRef)}", usesEvent="true", eventType="onClick",data-ref="8as3cf5txk9", 
              >
                
              </div>
              index.jsx

            </div>

            <div class="flex gap-3 py-5 px-5 border-t border-base-300 w-fit">
              <ul class='p-1 flex   gap-4'>
                <div class='flex flex-col  '>
                  <span class='opacity-60'>1</span>
                  <span class='opacity-60'>2</span>
                  <span class='opacity-60'>3</span>
                  <span class='opacity-60'>4</span>
                  <span class='opacity-60'>5</span>
                  <span class='opacity-60'>6</span>
                  <span class='opacity-60'>7</span>
                  <span class='opacity-60'>8</span>
                  <span class='opacity-60'>9</span>
                  <span class='opacity-60'>10</span>
                  <span class='opacity-60'>11</span>
                  <span class='opacity-60'>12</span>
                  <span class='opacity-60'>13</span>
                  <span class='opacity-60'>14</span>
                  <span class='opacity-60'>15</span>
                  <span class='opacity-60'>16</span>
                  <span class='opacity-60'>17</span>
                </div>
                <div>

                  <li class='hover:bg-base-200 rounded'>
                    <span class='mx-2'><span class='text-yellow-600'>class</span> <span class='text-blue-500'>Index</span> <span class='text-yellow-600'>extends</span> <span class='text-purple-500'>Component</span> <span class='text-purple-500'>${'{'}</span></span>
                  </li>
                  <li>
                    <span class='mx-4'><span class='text-yellow-600'>constructor</span>(props) <span class='text-purple-500'>${'{'}</span></span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-blue-500'>super</span>(props)</span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-purple-500'>this</span>.key = 'index'</span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-purple-500'>this</span>.router.use = (<span class='text-yellow-600'>async</span> (<span class='text-yellow-600'>req</span>, <span class='text-yellow-600'>res</span>) <span class='text-purple-500'>${'{'}</span></span>
                  </li>
                  <li class='break-words'>
                    <span class='mx-6'><span class='text-yellow-600'>let</span> <span class='text-yellow-600'>data</span> = <span class='text-yellow-600'>await</span> <span class='text-yellow-600'>fetch</span>(<span class='text-green-500'>'promised-data'</span>)</span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-yellow-600'>let</span> <span class='text-yellow-600'>json</span> = <span class='text-yellow-600'>await</span> <span class='text-yellow-600'>data</span>.<span class='text-yellow-600'>json</span>()</span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-yellow-600'>this</span>.states['data'] = <span class='text-yellow-600'>json</span></span>
                  </li>
                  <li>
                    <span class='mx-4'><span class='text-purple-500'>${'}'})</span></span>
                  </li>
                  <li>
                    <span class='mx-4'><span class='text-yellow-600'>render</span>() <span class='text-purple-500'>${'{'}</span></span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-blue-500'>return</span> <span class='text-purple-500'>&lt;&gt;</span></span>
                  </li>
                  <li>
                    <span class='mx-8'>
                      <span class='text-purple-500'>&lt;</span><span class='text-blue-500'>div</span> <span class='text-yellow-600'>class</span>=<span class='text-green-500'>'flex flex-col gap-5'</span><span class='text-purple-500'>&gt;</span>

                    </span>
                  </li>
                  <li>
                    <span class='mx-10'>
                      <span class="text-purple-500">
                        &lt;<span class='text-blue-500'>h1&gt;</span>
                        Hello
                        &lt;/<span class='text-blue-500'>h1</span>&gt;
                      </span>
                    </span>
                  </li>
                  <li>
                    <span class='mx-8'>
                      <span class='text-purple-500'>&lt;</span><span class='text-blue-500'>/div</span><span class='text-purple-500'>&gt;</span>

                    </span>
                  </li>
                  <li>
                    <span class='mx-6'><span class='text-purple-500'>&lt;</span><span class='text-blue-500'>/</span><span class='text-purple-500'></span></span>
                  </li>
                  <li>
                    <span class='mx-4'><span class='text-purple-500'>${'}'}</span></span>
                  </li>
                  <li>
                    <span class='mx-2'><span class='text-purple-500'>${'}'}</span></span>
                  </li>

                </div>
              </ul>
               

            </div>

          </div>
          
            
      </div>
     <div class="relative flex">
     <div class='mt-24 absolute mb-6  flex flex-col gap-3'>
          <p class='text-sm'>
            Previous
          </p>
          <span

            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '
            onClick="${this.bind(`this.props?.swapPage({ page: 'getting-started', subpage: 'project-structure' }); `, false, false, 'wluqdxl5ls', "", null)}", usesEvent="true", eventType="onClick",data-ref="wluqdxl5ls", 
          >Project Structure  </span>
        </div>
        <div class='mt-24 absolute mb-6 end-5  flex flex-col gap-3'>
          <p class='text-sm'>
            Next
          </p>
          <span

            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '
            onClick="${this.bind(`this.props?.swapPage({ page: 'getting-started', subpage: 'deployment' }); `, false, false, 'koi5xbur9o', "", null)}", usesEvent="true", eventType="onClick",data-ref="koi5xbur9o", 
          >Deployment  </span>
        </div>
     </div>
    `
  }
}




 //wascompiled