import {
    Component,
    e,
    useState,
    useEffect,
    useFetch,
    useAsyncState,
    Fragment,
} from "vaderjs";
import { document } from "vaderjs/document";
import fs from "fs";
import ansiColors from "ansi-colors";
let path2 = require("path");
globalThis.Fragment = Fragment;
globalThis.window = {
    location: {
        hash: "",
        host: "",
    },
};
globalThis.Component = Component;
globalThis.e = e;
globalThis.useFetch = useFetch;
globalThis.useEffect = useEffect;
globalThis.useAsyncState = useAsyncState;
globalThis.useState = useState;
globalThis.genKey = () => {
    return crypto.randomUUID();
};
globalThis.document = {
    createElement: (tag) => { },
    getElementById: (id) => { },
    querySelector: (query) => { },
};
await Bun.build({
    entrypoints: [process.env.ENTRYPOINT],
    minify: true,
    root: process.cwd() + "/dist/",
    outdir: process.cwd() + "/dist/",
    format: "esm",
    ...(process.env.DEV ? { sourcemap: "inline" } : {}),
});
let isClass = function (element) {
    return element.toString().startsWith("class");
};
const generatePage = async (
    data = { path: process.env.INPUT, route: process.env.OUT }
) => {
    const { path, route } = data;
    if (path.includes("root.js")) return;
    let html = await import(path).then((m) => m.default);
    let { head } = await import(path).then((m) => m);
    let isFunction = false;
    globalThis.isServer = true;
    if (isClass(html)) {
        html = new html();
        html.Mounted = true;
        html = html.render();
    } else {
        isFunction = true;
        let instance = new Component();
        html = html.bind(instance);
        instance.render = html;
        html = instance.render();
    }

    let h = document(html);
    if (!fs.existsSync(process.cwd() + "/dist" + path2.dirname(route))) {
        fs.mkdirSync(process.cwd() + "/dist" + path2.dirname(route), {
            recursive: true,
        });
    }
    let headHtml = "";
    if (head) {
        headHtml = document(head()); 
    }

    console.log(route)
    await Bun.write(
        process.cwd() + "/dist/" + route + "/index.html",
        `<!DOCTYPE html><head>${headHtml}</head>${h}
              <script type="module"> 
              import c from '${process.env.filePath}'
              import {render} from '/src/vader/index.js'
              render(c, document.body.firstChild)
              </script>
              `
    );
    console.log(
        ansiColors.blue(
            `${process.env.filePath.replace(".js", ".jsx")} - ${parseInt(
                process.env.size
            ).toFixed(2)}kb`
        )
    );
    process.exit(0);
};
 try {
    generatePage({ path: process.env.INPUT, route: process.env.OUT });
 } catch (error) {
    console.log(ansiColors.red(error))
 }
