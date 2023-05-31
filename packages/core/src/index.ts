import { Plugin } from 'vite'
import { readFile } from "node:fs/promises";
import path from 'node:path';

const createScript = async () => {
    const filePath = path.resolve()+'/node_modules/vite-plugin-consoles/public/proxy-console.js';    
    const fileContent = await readFile(filePath, { encoding: 'utf-8'});
    const scriptTag = `<script>${fileContent}</script>`;
    return scriptTag
}

interface Options {
  include?: string[]; // 配置需要解析的文件夹名称 子文件 都会被解析
}
// 判断字符串中console.log数量
const checkConsoleLogCount = (strings: string) => {
  const count =  strings.matchAll(/console.log\((.*?)\)/g);
  return [...count].length
}
export default function vitePluginConsole(options:Options) {
    const plugin: Plugin = {
      name: 'transform-console-source',
      apply: 'serve',
      transform(src, id) {
          // 默认只解析src下业务代码里面的console 根路径+src
          const defaultResolvePath = path.join(path.resolve(), 'src')
          const resolvePaths = [defaultResolvePath];
          if(options?.include) {
            options.include.forEach(pathName => {
              resolvePaths.push(`${path.join(path.resolve(), pathName)}`)
            })
          }
          const needResolveId = resolvePaths.some(rPath => id.includes(rPath))
          if(needResolveId) { 
              const matchs = src.matchAll(/console.log\((.*?)\)(.*)?/g); // 一行多个log 也会匹配 这种不考虑处理 console.log(xx);;;;;;console.log('yy') 走原始打印
             [...matchs].forEach((item) => {
                      const [matchStr, args] = item;
                      // 如果不是分号 或者) 结尾 说明不是log函数
                      if(matchStr.endsWith(';') || matchStr.endsWith(')')) {
                        let replaceMatch = ''
                        const haveSemicolon = matchStr.endsWith(";"); 
                        const sliceIndex = haveSemicolon ? -2 : -1;
                        const temp = matchStr.slice(0,sliceIndex);
                        console.log(temp, )
                        if(checkConsoleLogCount(matchStr) < 2) {
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