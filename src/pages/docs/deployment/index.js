import { Component } from "/vader.js"

export class Deployment extends Component {
  constructor(props) {
    super(props)
    this.key = props?.key
  }

  render() {

    return `
      <div class='relative flex flex-col gap-5'>
        <div class="text-sm breadcrumbs">
          <ul>
            <li><a class='no-underline'
              onClick="${this.bind(`this.props?.swapPage({ page: 'getting-started', subpage: '' }); `, false, false, 'jyogbu1tvei', "", null)}", usesEvent="true", eventType="onClick",data-ref="jyogbu1tvei", 
            >Getting Started</a></li>
            <li><a class='font-semibold'>Deployment</a></li>
          </ul>
        </div>
        <h2 class='text-4xl font-bold'>Deployment</h2>
        <p>Learn how to deploy your vaderjs application</p>
        <hr></hr>
        <p>
          A vaderjs application can be deployed to any static/serverless hosting provider. Vader compiles your application to static js files that can be served by any web server.
        </p>
        <h2 class='text-4xl font-bold mt-6'>Static Hosting</h2>
        <p class='mt-2'>
          Using <badge class='bg-base-200 rounded p-1 text-sm '>npx vaderjs --build</badge> you can compile your application to the dist/ folder. This folder contains all the static files needed to run your application, you can then
          deploy these files to any static hosting provider.
        </p>
        <div class="flex gap-5 hero mt-8">

          <svg
            class="w-8 h-8"
            width="76"
            height="65"
            viewBox="0 0 76 65"
            fill="none" xmlns="http://www.w3.org/2000/svg"><path
              d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="#000000" /></svg>

          <h2 class="font-bold text-3xl">Vercel</h2>

        </div>
        <span class="badge">Recommended</span>
        <p>
          Deploy your vaderjs application to Vercel.
        </p>
        <h2 class='text-xl font-bold mt-2'>
          Deploy using git
        </h2>
        <ul class='list-disc ml-5 list-inside'>
          <li>Build and push your application to a git repository</li>
          <li>
            <a href="https://vercel.com/new" arial-label="vercel new deployment" title="vercel new deployment" class="text-blue-500" target="_blank">Import your project</a>  to Vercel
          </li>
          <li>Connect your git repository to Vercel</li>
          <li>Deploy your application</li>
        </ul>
        <p>
          After your project has been imported and deployed, all subsequent pushes to branches will generate Preview Deployments, and all changes made to the Production Branch (commonly “main”) will result in a Production Deployment.
        </p>
        <a href="https://vercel.com/docs/git" aria-lable="vercel github" title="vercel github" class="text-blue-500 flex gap-5" target="_blank">Learn more about vercel git deployments</a>

        <h2 class='text-3xl font-bold mt-2 flex gap-5 hero'>
        <svg class="w-12 h-12" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"  viewBox="0 0 24 24">
    <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6c0-0.4,0-0.9,0.2-1.3 C7.2,6.1,7.4,6,7.5,6c0,0,0.1,0,0.1,0C8.1,6.1,9.1,6.4,10,7.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3c0.9-0.9,2-1.2,2.5-1.3 c0,0,0.1,0,0.1,0c0.2,0,0.3,0.1,0.4,0.3C17,6.7,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4 c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3C22,6.1,16.9,1.4,10.9,2.1z"></path>
</svg> Github Pages
        </h2>

        <p>
          Deploy your vaderjs application to Github Pages.
        </p>
        <ul class='list-disc ml-5 list-inside'>
          <li>Build and push your application to a git repository</li>
          <li>
            Enable Github Pages for your repository and configure proper branch and folder
          </li>
          <li>Run <badge class='bg-base-200 rounded p-1 text-sm '>npx vaderjs --build</badge> and push the dist/ folder to your repository</li>
          <li>
            Visit your application at the url provided by Github Pages - and enjoy!
          </li>
        </ul>
        <a href="https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site" aria-lable="github pages" title="github pages" class="text-blue-500 flex gap-5" target="_blank">Learn more about github pages</a>

        <h2 class='text-3xl font-bold mt-5 flex gap-5 hero  '>
          <svg viewBox="0 0 80 80" class="w-12 h-12 rounded" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">


            <defs>
              <linearGradient x1="0%" y1="100%" x2="100%" y2="0%" id="linearGradient-1">
                <stop stop-color="#BD0816" offset="0%"></stop>
                <stop stop-color="#FF5252" offset="100%"></stop>
              </linearGradient>
            </defs>
            <g id="Icon-Architecture/64/Arch_AWS-Amplify-Console_64" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="Icon-Architecture-BG/64/Mobile" fill="url(#linearGradient-1)">
                <rect id="Rectangle" x="0" y="0" width="80" height="80"></rect>
              </g>
              <path d="M59.6107389,59.179 L39.5067389,20 L45.2577389,20 L65.3627389,59.179 L59.6107389,59.179 Z M67.8887389,59.722 L46.7587389,18.544 C46.5887389,18.21 46.2447389,18 45.8697389,18 L37.8697389,18 C37.5207389,18 37.1977389,18.181 37.0157389,18.479 C36.8347389,18.776 36.8207389,19.147 36.9797389,19.457 L58.1097389,60.636 C58.2807389,60.969 58.6247389,61.179 58.9997389,61.179 L66.9997389,61.179 C67.3477389,61.179 67.6717389,60.998 67.8527389,60.7 C68.0347389,60.403 68.0487389,60.033 67.8887389,59.722 L67.8887389,59.722 Z M47.5987389,59.179 L32.2147389,30.332 L35.3657389,25.121 L53.3407389,59.179 L47.5987389,59.179 Z M36.3097389,22.624 C36.1407389,22.305 35.8147389,22.101 35.4547389,22.091 C35.1087389,22.07 34.7567389,22.265 34.5697389,22.573 L30.2097389,29.784 C30.0267389,30.086 30.0167389,30.461 30.1817389,30.772 L46.1167389,60.65 C46.2907389,60.975 46.6307389,61.179 46.9997389,61.179 L54.9997389,61.179 C55.3497389,61.179 55.6747389,60.995 55.8557389,60.695 C56.0367389,60.395 56.0477389,60.022 55.8837389,59.712 L36.3097389,22.624 Z M14.7727389,59.179 L28.8847389,35.84 L31.7597389,41.229 L25.1337389,52.678 C24.9547389,52.988 24.9547389,53.369 25.1327389,53.679 C25.3117389,53.988 25.6417389,54.179 25.9997389,54.179 L38.6667389,54.179 L41.3327389,59.179 L14.7727389,59.179 Z M40.1487389,52.708 C39.9747389,52.383 39.6347389,52.179 39.2657389,52.179 L27.7337389,52.179 L33.7687389,41.75 C33.9427389,41.451 33.9487389,41.084 33.7867389,40.779 L29.8227389,33.346 C29.6527389,33.029 29.3267389,32.827 28.9667389,32.817 C28.5827389,32.8 28.2697389,32.992 28.0847389,33.299 L12.1437389,59.661 C11.9577389,59.971 11.9517389,60.356 12.1287389,60.67 C12.3057389,60.985 12.6377389,61.179 12.9997389,61.179 L42.9997389,61.179 C43.3507389,61.179 43.6757389,60.995 43.8567389,60.694 C44.0377389,60.392 44.0477389,60.018 43.8817389,59.708 L40.1487389,52.708 Z" id="AWS-Amplify-Console_Icon_64_Squid" fill="#FFFFFF"></path>
            </g>
          </svg>   Aws Amplify
        </h2>

        <ul class=" list-inside list-disc  ml-5 ">
          <li>Login to your AWS account</li>
          <li>
            <a href="https://console.aws.amazon.com/amplify/home" arial-label="aws amplify" title="aws amplify" class="text-blue-500" target="_blank">Create a new Amplify app</a>
          </li>

          <li>Connect your git repository to Amplify</li>
          <li>Deploy your application</li>
        </ul>
        <p>
          After your project has been imported and deployed, it will be available at the url provided by Amplify.
        </p>
        <a href="https://docs.aws.amazon.com/amplify/latest/userguide/getting-started.html" aria-lable="aws amplify" title="aws amplify" class="text-blue-500 flex gap-5" target="_blank">Learn more about aws amplify</a>
      </div>
    `
  }
}

 //wascompiled