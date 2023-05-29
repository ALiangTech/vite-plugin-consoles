import { Plugin } from 'vite'
import { readFile } from "node:fs/promises";
import path from 'node:path';

const createScript = async () => {
    const filePath = path.resolve()+'/node_modules/vite-plugin-consoles/public/proxy-console.js';    
    const fileContent = await readFile(filePath, { encoding: 'utf-8'});
    const scriptTag = `<script>${fileContent}</script>`;
    return scriptTag
}
export default function vitePluginConsole() {
    const plugin: Plugin = {
      name: 'transform-console-source',
      transform(src, id) {
          if(id.includes('src')) { // 只解析src 下的console
              const matchs = src.matchAll(/console.log\((.*)\);?/g);
             [...matchs].forEach((item) => {
                      const [matchStr, args] = item;
                      let replaceMatch = ''
                      const haveSemicolon = matchStr.endsWith(";"); 
                      const sliceIndex = haveSemicolon ? -2 : -1;
                      const temp = matchStr.slice(0,sliceIndex); 
                      const tempArgs = args.split(",").map(item => {
                          if(item.endsWith('"')) {
                              return item
                          }
                          return `"${item}"`
                      }).join(",")
                      replaceMatch = `${temp},['isPlugin',${tempArgs}]);`
                      src = src.replace(matchStr, replaceMatch)
              });
          }
          return {
            code: src,
            id,
          }
      },
      async transformIndexHtml(htmlString) {
        const scriptString = await createScript()
        const [start, end] = htmlString.split('</head>');
        const nstart = `${start}${scriptString}`
        return [nstart,end].join('</head>')
      }
    }
    return plugin
}