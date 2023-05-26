import { Plugin } from 'vite'
export default function vitePluginConsole() {
    const plugin: Plugin = {
      name: 'transform-console-source',
      transform(src, id) {
          if(id.includes('src')) {
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
    }
    return plugin
  }