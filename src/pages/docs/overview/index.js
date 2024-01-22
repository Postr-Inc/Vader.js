import{Component as n,useState as s,useRef as e}from"/vader.js";import{Routing as a}from"/src/pages/docs/routing/index.js";import{Deployment as t}from"/src/pages/docs/deployment/index.js";class l extends n{constructor(n){super(n),this.key="installation"}render(){let[n,s]=this.useState("saved",!1),e=this.useRef("copiedRef",null);return`\n      <div class='relative'>\n        <div class="text-sm breadcrumbs">\n          <ul>\n            <li><a class='no-underline'\n              onClick="${this.bind("this.props?.swapPage({ page: 'getting-started', subpage: '' }); ",!1,!1,"lhmgnvyelgg","",null)}", usesEvent="true", eventType="onClick",data-ref="lhmgnvyelgg", \n            >Getting Started</a></li>\n            <li><a class='font-semibold'>Installation</a></li>\n          </ul>\n        </div>\n        <h1 class='font-bold text-4xl'>\n          Installation\n        </h1>\n        <div class='flex mt-5 flex-col gap-5'>\n          <p class='text-md'>\n            System requirements:\n          </p>\n          <p class='flex gap-3'>\n            <span> -</span>    <span> <a class="text-blue-500" href='https://nodejs.org/en/download' target='_blank'> Nodejs 18</a> or later.</span>\n          </p>\n          <p class='flex gap-3'>\n            <span>-</span> <span>Macos, Windows, and Linux are fully supported</span>\n          </p>\n          <hr></hr>\n          <h2 class='text-2xl font-bold'>\n            Automatic Setup\n          </h2>\n          <p>\n            We recommend you run <code class='bg-gray-100 p-1 rounded-md text-blue-500'>npx vaderjs --build</code> to automatically setup your project. It will setup all required folders and files for you.\n          </p>\n          <div class="relative bg-base-100 border border-slate-200 rounded">\n            <div class='flex gap-5 hero   p-4'>\n              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5", stroke="currentColor" class="w-6 h-6">\n                <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />\n              </svg>\n              <div class="absolute end-5"\n                ref="${e.bind}",\n                onClick="${this.bind("navigator.clipboard.writeText('npx vaderjs@latest --build'); setSaved(!saved, copiedRef.bind); setTimeout(() => {; setSaved(false, copiedRef.bind); }, 1000); ",!1,!1,"r0xo28906b","setSaved,saved,copiedRef,",s,n,e)}", usesEvent="true", eventType="onClick",data-ref="r0xo28906b", \n              >\n                <div class='hover:bg-base-200 px-[.4rem] py-[.4rem] rounded'>\n                  ${n?'\n                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5", stroke="currentColor" class="  stroke-green-500  w-6 h-6">\n                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />\n                      </svg>\n\n                    ':'\n                        <svg class="  cursor-pointer", data-testid="geist-icon" fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: currentcolor; width: 20px; height: 20px;"><path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z"></path></svg>\n                      '}\n\n\n\n                </div>\n              </div>\n              Terminal\n\n            </div>\n            <div class="flex gap-3 py-5 px-5 border-t border-base-300">\n              <span> npx </span> <span class='text-blue-500'>vaderjs@latest --build</span>\n            </div>\n\n          </div>\n          <h2 class='text-2xl font-bold'>\n            Manual Setup\n          </h2>\n          <h2 class='text-xl font-bold'>\n            Creating Directories\n          </h2>\n          <p>\n            Vaderjs   uses file based routing to determine your apps routing structure, which means your apps routes rely on your file struture at build time.\n          </p>\n          <h2 class='font-semibold text-xl'>\n            The <span class='font-bold badge bg-base-200  border border-slate-200 text-sm'>pages/</span> folder\n          </h2>\n          <p>\n            This folder is used to store your pages. Each folder acts as a new route and each <span class='text-blue-500'>index.jsx</span> or dynamic <span class='text-blue-500'  >[parameter].jsx</span> file acts as a new page.\n          </p>\n          <p>\n            Create an <span class='badge bg-base-200 border border-slate-200 rounded'>pages/</span> folder, then add  <span class="badge bg-base-200 border border-slate-200 rounded">index.jsx</span>\n            that page will be rendered when the user goes to  (<span class="badge bg-base-200 border border-slate-200 rounded-box">/</span>).\n          </p>\n          <ul class="menu  border border-slate-200 rounded" aria-label='file structure example' title='file structure example'>\n            <li><a>index.jsx - <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com/#/</span></a></li>\n            <li>\n              <details open>\n                <summary>pages/home <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com/#/home</span></summary>\n                <ul>\n                  <li><a><svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">\n                    <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />\n                    <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />\n                  </svg>index.jsx</a></li>\n                  <li>\n                    <details open>\n                      <summary>site</summary>\n                      <ul>\n                        <li><a><svg class="w-4 h-4 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">\n                          <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />\n                          <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />\n                        </svg>[id].jsx <span class='badge bg-base-200 border border-slate-200 rounded'>acme.com/#/home/:site</span></a></li>\n                      </ul>\n                    </details>\n                  </li>\n                </ul>\n              </details>\n            </li>\n          </ul>\n          <p>\n            Create an index.jsx file within each route or a dynamic [parameter].jsx file to create a dynamic route.\n          </p>\n          <div class="relative bg-base-100 border text-sm border-slate-200 rounded">\n            <div class='flex gap-5 hero   p-4'>\n              <svg class="w-5 h-5 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">\n                <path d="M19.718 9c0-1.429-1.339-2.681-3.467-3.5.029-.18.077-.37.1-.545.217-2.058-.273-3.543-1.379-4.182-1.235-.714-2.983-.186-4.751 1.239C8.45.589 6.7.061 5.468.773c-1.107.639-1.6 2.124-1.379 4.182.018.175.067.365.095.545C2.057 6.319.718 7.571.718 9c0 1.429 1.339 2.681 3.466 3.5-.028.18-.077.37-.095.545-.218 2.058.272 3.543 1.379 4.182.376.213.803.322 1.235.316a5.987 5.987 0 0 0 3.514-1.56 5.992 5.992 0 0 0 3.515 1.56 2.44 2.44 0 0 0 1.236-.316c1.106-.639 1.6-2.124 1.379-4.182-.019-.175-.067-.365-.1-.545 2.132-.819 3.471-2.071 3.471-3.5Zm-6.01-7.548a1.5 1.5 0 0 1 .76.187c.733.424 1.055 1.593.884 3.212-.012.106-.043.222-.058.33-.841-.243-1.7-.418-2.57-.523a16.165 16.165 0 0 0-1.747-1.972 4.9 4.9 0 0 1 2.731-1.234Zm-7.917 8.781c.172.34.335.68.529 1.017.194.337.395.656.6.969a14.09 14.09 0 0 1-1.607-.376 14.38 14.38 0 0 1 .478-1.61Zm-.479-4.076a14.085 14.085 0 0 1 1.607-.376c-.205.313-.405.634-.6.969-.195.335-.357.677-.529 1.017-.19-.527-.35-1.064-.478-1.61ZM6.3 9c.266-.598.563-1.182.888-1.75.33-.568.69-1.118 1.076-1.65.619-.061 1.27-.1 1.954-.1.684 0 1.333.035 1.952.1a19.63 19.63 0 0 1 1.079 1.654A19.3 19.3 0 0 1 14.136 9a18.869 18.869 0 0 1-1.953 3.403 19.218 19.218 0 0 1-3.931 0 20.163 20.163 0 0 1-1.066-1.653A19.33 19.33 0 0 1 6.3 9Zm7.816 2.25c.2-.337.358-.677.53-1.017.191.527.35 1.065.478 1.611a14.48 14.48 0 0 1-1.607.376c.202-.314.404-.635.597-.97h.002Zm.53-3.483c-.172-.34-.335-.68-.53-1.017a20.214 20.214 0 0 0-.6-.97c.542.095 1.078.22 1.606.376a14.113 14.113 0 0 1-.478 1.611h.002ZM10.217 3.34c.4.375.777.773 1.13 1.193-.37-.02-.746-.033-1.129-.033s-.76.013-1.131.033c.353-.42.73-.817 1.13-1.193Zm-4.249-1.7a1.5 1.5 0 0 1 .76-.187 4.9 4.9 0 0 1 2.729 1.233A16.25 16.25 0 0 0 7.71 4.658c-.87.105-1.728.28-2.569.524-.015-.109-.047-.225-.058-.331-.171-1.619.151-2.787.885-3.211ZM1.718 9c0-.9.974-1.83 2.645-2.506.218.857.504 1.695.856 2.506-.352.811-.638 1.65-.856 2.506C2.692 10.83 1.718 9.9 1.718 9Zm4.25 7.361c-.734-.423-1.056-1.593-.885-3.212.011-.106.043-.222.058-.331.84.243 1.697.418 2.564.524a16.37 16.37 0 0 0 1.757 1.982c-1.421 1.109-2.714 1.488-3.494 1.037Zm3.11-2.895c.374.021.753.034 1.14.034.387 0 .765-.013 1.139-.034a14.4 14.4 0 0 1-1.14 1.215 14.232 14.232 0 0 1-1.139-1.215Zm5.39 2.895c-.782.451-2.075.072-3.5-1.038a16.248 16.248 0 0 0 1.757-1.981 16.41 16.41 0 0 0 2.565-.523c.015.108.046.224.058.33.175 1.619-.148 2.789-.88 3.212Zm1.6-4.854A16.562 16.562 0 0 0 15.216 9c.352-.811.638-1.65.856-2.507C17.743 7.17 18.718 8.1 18.718 9c0 .9-.975 1.83-2.646 2.507h-.004Z" />\n                <path d="M10.215 10.773a1.792 1.792 0 1 0-1.786-1.8v.006a1.788 1.788 0 0 0 1.786 1.794Z" />\n              </svg>\n              <div class="absolute end-5"\n                ref="${e.bind}",\n                onClick="${this.bind("navigator.clipboard.writeText(examples['1']); setSaved(!saved, copiedRef.bind); setTimeout(() => {; setSaved(false, copiedRef.bind); }, 1000); ",!1,!1,"8es6v3vxc3e","setSaved,saved,copiedRef,",s,n,e)}", usesEvent="true", eventType="onClick",data-ref="8es6v3vxc3e", \n              >\n                <div class='hover:bg-base-200 px-[.4rem] py-[.4rem] rounded'>\n                  ${n?'\n                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5", stroke="currentColor" class="  stroke-green-500  w-6 h-6">\n                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />\n                      </svg>\n\n                    ':'\n                        <svg class="  cursor-pointer", data-testid="geist-icon" fill="none" height="24" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="24" aria-hidden="true" style="color: currentcolor; width: 20px; height: 20px;"><path d="M6 17C4.89543 17 4 16.1046 4 15V5C4 3.89543 4.89543 3 6 3H13C13.7403 3 14.3866 3.4022 14.7324 4M11 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H11C9.89543 7 9 7.89543 9 9V19C9 20.1046 9.89543 21 11 21Z"></path></svg>\n                      '}\n\n\n\n                </div>\n              </div>\n              index.jsx\n\n            </div>\n\n            <div class="flex gap-3 py-5 px-5 border-t border-base-300">\n              <ul class='p-1 flex   gap-4'>\n                <div class='flex flex-col  '>\n                  <span class='opacity-60'>1</span>\n                  <span class='opacity-60'>2</span>\n                  <span class='opacity-60'>3</span>\n                  <span class='opacity-60'>4</span>\n                  <span class='opacity-60'>5</span>\n                  <span class='opacity-60'>6</span>\n                  <span class='opacity-60'>7</span>\n                  <span class='opacity-60'>8</span>\n                  <span class='opacity-60'>9</span>\n                  <span class='opacity-60'>10</span>\n                  <span class='opacity-60'>11</span>\n                  <span class='opacity-60'>12</span>\n                  <span class='opacity-60'>13</span>\n                  <span class='opacity-60'>14</span>\n                  <span class='opacity-60'>15</span>\n                  <span class='opacity-60 xl:hidden lg:hidden'>16</span>\n                  <span class='opacity-60  xl:hidden lg:hidden'>17</span> \n                </div>\n                <div>\n\n                  <li class='hover:bg-base-200 rounded'>\n                    <span class='mx-2'><span class='text-yellow-600'>import</span></span> <span class='text-blue-500'>{Component, useState}</span> <span class='text-yellow-600'>from</span> <span class='text-green-500'>'/vader.js'</span> \n                  </li>\n                  <li class='hover:bg-base-200 rounded'>\n                    <span class='mx-2'><span class='text-yellow-600'>class</span> <span class='text-blue-500'>Index</span> <span class='text-yellow-600'>extends</span> <span class='text-purple-500'>Component</span> <span class='text-purple-500'>{</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-4'><span class='text-yellow-600'>constructor</span>(props) <span class='text-purple-500'>{</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-6'><span class='text-blue-500'>super</span>(props)</span>\n                  </li>\n                  <li>\n                    <span class='mx-6'><span class='text-purple-500'>this</span>.key = 'index'</span>\n                  </li>\n                  <li>\n                    <span class='mx-4'><span class='text-purple-500'>}</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-4'><span class='text-yellow-600'>render</span>() <span class='text-purple-500'>{</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-6'><span class='text-blue-500'>return</span> <span class='text-purple-500'>&lt;&gt;</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-8'>\n                      <span class='text-purple-500'>&lt;</span><span class='text-blue-500'>div</span> <span class='text-yellow-600'>class</span>=<span class='text-green-500'>'flex flex-col gap-5'</span><span class='text-purple-500'>&gt;</span>\n\n                    </span>\n                  </li>\n                  <li>\n                    <span class='mx-10'>\n                      <span class="text-purple-500">\n                        &lt;<span class='text-blue-500'>h1&gt;</span>\n                        Hello\n                        &lt;/<span class='text-blue-500'>h1</span>&gt;\n                      </span>\n                    </span>\n                  </li>\n                  <li>\n                    <span class='mx-8'>\n                      <span class='text-purple-500'>&lt;</span><span class='text-blue-500'>/div</span><span class='text-purple-500'>&gt;</span>\n\n                    </span>\n                  </li>\n                  <li>\n                    <span class='mx-6'><span class='text-purple-500'>&lt;</span><span class='text-blue-500'>/</span><span class='text-purple-500'></span></span>\n                  </li>\n                  <li>\n                    <span class='mx-4'><span class='text-purple-500'>}</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-2'><span class='text-purple-500'>}</span></span>\n                  </li>\n                  <li>\n                    <span class='mx-2'><span class='text-purple-500'>export</span> <span class='text-purple-500'>default</span> <span class='text-blue-500'>Index</span></span>\n                  </li>\n\n                </div>\n              </ul>\n\n            </div>\n\n          </div>\n\n          <div class='card w-full rounded border border-slate-200 bg-base-100 '>\n            <p class='p-2 font-semibold text-sm'>\n              Good to know:\n            </p>\n            <div class='card-body p-2'>\n              <div class='gap-2 flex'>\n                <span>-</span><p>You can optionally use <span class='font-bold text-sm'>src/</span> and <span class=' text-blue-500'>public/</span> folders to store your source code and static assets.</p>\n              </div>\n            </div>\n          </div>\n\n        </div>\n\n        <div class='mt-12 absolute mb-6  flex flex-col gap-3'>\n          <p class='text-sm'>\n            Previous\n          </p>\n          <span\n\n            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '\n            onClick="${this.bind("console.log(this); this.props?.swapPage({ page: 'getting-started', subpage: '' }); ",!1,!1,"3afoazjcqmm","",null)}", usesEvent="true", eventType="onClick",data-ref="3afoazjcqmm", \n          >Getting Started  </span>\n        </div>\n        <div class='mt-12 absolute mb-6 end-5  flex flex-col gap-3'>\n          <p class='text-sm'>\n            Next\n          </p>\n          <span\n\n            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '\n            onClick="${this.bind("console.log(this); this.props?.swapPage({ page: 'getting-started', subpage: 'project-structure' }); ",!1,!1,"3k85h2uimrj","",null)}", usesEvent="true", eventType="onClick",data-ref="3k85h2uimrj", \n          >Project Structure </span>\n        </div>\n\n      </div>\n\n\n    `}}class r extends n{constructor(n){super(n),this.key="project-structure"}render(){return`\n     <div class='relative'>\n     <div class='flex flex-col relative gap-5'>\n        <div class="text-sm breadcrumbs">\n          <ul>\n            <li><a class='no-underline'\n              onClick="${this.bind("this.props?.swapPage({ page: 'getting-started', subpage: '' }); ",!1,!1,"0g79w5l72gaa","",null)}", usesEvent="true", eventType="onClick",data-ref="0g79w5l72gaa", \n            >Getting Started</a></li>\n            <li><a class='font-semibold'>Page Structure</a></li>\n          </ul>\n        </div>\n        <h1 class='font-bold text-4xl'>\n          Project Structure\n        </h1>\n        <p class="text-md">\n          This page provides an overview of different file conventions and folder structure of the pages directory.\n        </p>\n        <hr ></hr>\n        <h2 class='text-xl font-bold'>\n          Top Level Folders\n        </h2>\n\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>pages/</span> -  <span class=''>Page Router.</span>\n        </div>\n        <hr></hr>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>src/</span> - This folder contains all your source code.\n        </div>\n        <hr></hr>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>public/</span> - This folder contains all your static assets.\n        </div>\n      </div>\n      <br></br>\n      <hr ></hr>\n\n\n      <hr ></hr>\n      <h2 class='text-2xl mt-8 font-bold'>\n        Special Folder Names\n      </h2>\n      <div class='flex flex-col mt-5 gap-5'>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>404/</span> <span>-  This folder is used to create a custom 404 page.</span>\n        </div>\n      </div>\n      <div class='flex flex-col gap-5'>\n\n      </div>\n\n      <h2 class='text-2xl mt-8 font-bold'>\n        Routes\n      </h2>\n      <div class='flex flex-col mt-5 gap-5'>\n\n        <hr></hr>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>index.jsx</span> - The main file of the route used as a starting/default page.\n        </div>\n        <hr></hr>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>[param].jsx</span> <span>- A dynamic route file</span>\n        </div>\n        <hr></hr>\n        <div class='flex mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>[...].jsx</span> <span>- A dynamic wildcard file</span>\n        </div>\n      </div><br></br>\n      <hr></hr>\n      <h2 class='mb-5 mt-5 font-bold text-xl'>Folder Convention</h2>\n      <hr></hr>\n      <div class='flex flex-col relative mt-3 gap-5'>\n        <div class='flex  mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>[param]/</span> <span>-  This folder is used to create a dynamic route.</span>\n        </div>\n        <div class='flex  mt-5 gap-5 hero'>\n          <span class='font-bold badge text-blue-500'>[...]/</span> <span>-  This folder is used to create a wildcard param route .</span>\n        </div>\n        \n      </div>\n      <div class='mt-24 absolute mb-6  flex flex-col gap-3'>\n          <p class='text-sm'>\n            Previous\n          </p>\n          <span\n\n            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '\n            onClick="${this.bind("this.props?.swapPage({ page: 'getting-started', subpage: '' }); ",!1,!1,"rgjlcpaep6h","",null)}", usesEvent="true", eventType="onClick",data-ref="rgjlcpaep6h", \n          >Getting Started  </span>\n        </div>\n        <div class='mt-24 absolute mb-6 end-5  flex flex-col gap-3'>\n          <p class='text-sm'>\n            Next\n          </p>\n          <span\n\n            class='font-bold mb-12 hover:opacity-100 cursor-pointer opacity-60 '\n            onClick="${this.bind("this.props?.swapPage({ page: 'getting-started', subpage: 'routing' }); ",!1,!1,"vkyurim7zub","",null)}", usesEvent="true", eventType="onClick",data-ref="vkyurim7zub", \n          >Routing </span>\n        </div>\n     </div>\n    `}}export class Home extends n{constructor(n){super(n),this.key="index"}render(){return`\n\n      ${this.props?.page.includes("installation")?`\n          ${this.memoize(this.createComponent(l,{key:"installation",swapPage:function(n){this.props?.click(n.page,n.subpage)}.bind(this)},[""]))}\n        `:this.props?.page.includes("structure")?`\n            ${this.memoize(this.createComponent(r,{key:"project-structure",swapPage:function(n){this.props?.click(n.page,n.subpage)}.bind(this)},[""]))}\n          `:this.props?.page.includes("routing")?`\n          ${this.memoize(this.createComponent(a,{key:"routing",swapPage:function(n){this.props?.click(n.page,n.subpage)}.bind(this)},[""]))}\n          \n      `:this.props?.page.includes("deployment")?`\n          ${this.memoize(this.createComponent(t,{key:"deployment",swapPage:function(n){this.props?.click(n.page,n.subpage)}.bind(this)},[""]))}\n         `:`\n              <div class='flex flex-col relative mt-2 gap-5'>\n                <h1 class='font-bold text-4xl'>\n                  Introduction\n                </h1>\n                <p class="text-md">\n                   Vaders goal is to make it easy to build web applications without a huge bundle and complex build process.\n                </p>\n                <hr ></hr>\n               \n\n\n                <h2 class='text-xl font-bold'>\n                  What is Vaderjs?\n                </h2>\n                <div class='text-md flex flex-col gap-5'>\n                  <p>\n                    Vaderjs is a standalone react-like framework that allows you to build advanced complex dynamic web applications.\n                  </p>\n                  <p>\n                    You write raw jsx and vader will turn it into a fully functional web application.\n                    The goal of vader is to make it easy to build web applications without a huge bundle and build process.\n                  </p>\n                  <p>\n                    Whether you are building a simple todo app or corporate level application, vaderjs can scale to your needs.\n                  </p>\n                </div>\n                <hr></hr>\n                <h2 class='text-xl font-bold'>\n                  Main Features\n                </h2>\n                <table class="table  ">\n\n                  <thead>\n                    <tr>\n\n                      <th>Feature</th>\n                      <th>Description</th>\n\n                    </tr>\n                  </thead>\n                  <tbody>\n\n                    <tr>\n\n                      <td class='text-blue-500'>Routing</td>\n                      <td>\n                        A file based routing system, similar to nextjs pages router. Allows you to create dynamic routes and nested routes with ease - no configuration or setup required. Vader has various routing Features\n                        to enhance your spa experience.\n                      </td>\n\n                    </tr>\n\n                    <tr>\n\n                      <td class='text-blue-500'>React-JSX</td>\n                      <td>\n                        Vaderjs uses React-JSX syntax, which means you can easily port your existing react applications to vaderjs.\n                      </td>\n\n                    </tr>\n\n                    <tr>\n\n                      <td class='text-blue-500'>LightWeight</td>\n                      <td>Vaderjs leaves a small footprint allowing you to build without worrying about a huge bundle size.</td>\n\n                    </tr>\n                  </tbody>\n                </table>\n                <h2 class='text-xl font-bold'>\n                  Pre knowledge\n                </h2>\n                <p class='text-md'>\n                  Although the docs is meant to be beginner friendly, please keep in mind you still are required to know the basics of javascript, html and react to get the most out of vaderjs. If you need to\n                  improve your react skills <a class="flex hero mt-2 w-fit gap-2 text-blue-500 hover:underline" target="_blank" href="https://react.dev/learn"><svg\n                    class='w-5 h-5 inline-block'\n                    width="100%" height="100%" viewBox="-10.5 -9.45 21 18.9" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-sm me-0 w-10 h-10 text-link dark:text-link-dark flex origin-center transition-all ease-in-out"><circle cx="0" cy="0" r="2" fill="currentColor"></circle><g stroke="currentColor" stroke-width="1" fill="none"><ellipse rx="10" ry="4.5"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(60)"></ellipse><ellipse rx="10" ry="4.5" transform="rotate(120)"></ellipse></g></svg>click here.</a>\n\n                </p>\n                <hr></hr>\n                <div class='mt-5  mb-6 flex flex-col gap-3'>\n                  <p class='text-sm'>\n                    Next\n                  </p>\n                  <span\n\n                    class='font-bold cursor-pointer hover:opacity-100 opacity-60 '\n                    onClick="${this.bind("this.props?.click('getting-started', 'installation'); ",!1,!1,"36b41qo4oyh","",null)}", usesEvent="true", eventType="onClick",data-ref="36b41qo4oyh", \n                  >Installation  </span>\n                </div>\n              </div>\n\n\n            `}\n    `}}