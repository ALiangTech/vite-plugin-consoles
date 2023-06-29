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
const createSourcePosition = (args: string, options: ConsolePluginOptions) => {
  const {
    sourceStyle = "color:#646cff; background-color: #efdbff ;display:flex;padding: 8px 0",
  } = options;
  return `originConsole.group();originConsole.log('%c console.log(${args.replace(
    /"'/g,
    '"'
  )}) 输出的源码位置', "${sourceStyle}");`;
};

export default function vitePluginConsole(options: ConsolePluginOptions = {}) {
  const plugin: Plugin = {
    name: "transform-console-source",
    apply: "serve",
    transform(src, id) {
      const { include = /src/, exclude } = options;
      const filter = createFilter(include, exclude);
      if (filter(id)) {
        const matchs = src.matchAll(/console.log\((.*?)\)(.*)?/g);
        [...matchs].forEach((item) => {
          const [matchStr, args] = item;
          try {
            const code = addArgumentToConsoleLog(matchStr); // 添加完参数后的新的console.log函数 字符串

            src = src.replace(
              matchStr,
              `${createSourcePosition(args, options)};${code}`
            );
            console.log(code);
          } catch (error) {
            console.log("test", error);
          }
        });
      }
    }
    return plugin
}