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
      apply: 'serve',
      transform(src, id) {
          if(id.includes('src')) { // 只解析src 下的console
              const matchs = src.matchAll(/console.log\((.*?)\)(.*)?/g);
             [...matchs].forEach((item) => {
                      const [matchStr, args] = item;
                      // 如果不是分号 或者) 结尾 说明不是log函数
                      console.log(matchStr, "matchStr")
                      if(matchStr.endsWith(';') || matchStr.endsWith(')')) {
                        console.log(matchStr, args, "matchStr, args")
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
                          // originConsole 用来做源代码定位
                          // 使用正则表达式替换双引号或单引号为空字符串
                        replaceMatch = `originConsole.log("%c${matchStr.replace(/["']/g, '')}输出的源码位置", "color:#42b883; background-color: #fff;display:flex;padding: 8px");${temp},['isPlugin',${tempArgs}]);`
                        src = src.replace(matchStr, replaceMatch)
                    }
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