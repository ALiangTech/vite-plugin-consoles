import { Plugin, createFilter } from 'vite'
import { readFile } from "node:fs/promises";
import path from 'node:path';

const createScript = async () => {
    const filePath = path.resolve()+'/node_modules/vite-plugin-consoles/public/proxy-console.js';    
    const fileContent = await readFile(filePath, { encoding: 'utf-8'});
    const scriptTag = `<script>${fileContent}</script>`;
    return scriptTag
}
export interface Options {
  include?: string | RegExp | (string | RegExp)[]
  exclude?: string | RegExp | (string | RegExp)[]
}
export interface ConsolePluginOptions extends Options {
  sourceStyle?: string; // 源码定位的样式
}
// 判断字符串中console.log数量
const checkConsoleLogCount = (strings: string) => {
  const count =  strings.matchAll(/console.log\((.*?)\)/g);
  return [...count].length
}

// 创建源码定位输出
const createSourcePosition = (args:string, options:ConsolePluginOptions) => {
    const { sourceStyle ="color:#646cff; background-color: #efdbff ;display:flex;padding: 8px" } = options
    return `originConsole.log('%c console.log(${args.replace(/"'/g, '"')}) 输出的源码位置', "${sourceStyle}");`
};



export default function vitePluginConsole(options:ConsolePluginOptions = {}) {
    const plugin: Plugin = {
      name: 'transform-console-source',
      apply: 'serve',
      transform(src, id) {
        const {
          include = /src/,
          exclude,
        } = options
        const filter = createFilter(include, exclude)
          if(filter(id)) { 
              const matchs = src.matchAll(/console.log\((.*?)\)(.*)?/g); // 一行多个log 也会匹配 这种不考虑处理 console.log(xx);;;;;;console.log('yy') 走原始打印
             [...matchs].forEach((item) => {
                      const [matchStr, args] = item;
                      console.log(args, "args");
                      
                      // 如果不是分号 或者) 结尾 说明不是log函数
                      if(matchStr.endsWith(';') || matchStr.endsWith(')')) {
                        let replaceMatch = ''
                        const haveSemicolon = matchStr.endsWith(";"); 
                        const sliceIndex = haveSemicolon ? -2 : -1;
                        const temp = matchStr.slice(0,sliceIndex);
                        if(checkConsoleLogCount(matchStr) < 2) {
                          const tempArgs = args.split(",").map(item => {
                              if(item.endsWith('"')) {
                                  return item
                              }
                              return `"${item}"`
                          }).join(",")
                            // originConsole 用来做源代码定位
                            // 使用正则表达式替换双引号或单引号为空字符串
                          replaceMatch = `${createSourcePosition(args, options)}${temp},['isPlugin',${tempArgs}]);`
                          src = src.replace(matchStr, replaceMatch)
                        } else {
                          src = src.replace(matchStr, matchStr.replace(/console/g, 'originConsole') ) // 走原始打印
                        }
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