
declare const window: any;

const originConsole = window.console;
function withLogging(func:Function) {
    return function(...args: any[]) {
        let result = null;
        if(Array.isArray(args[args.length-1])) {
          // 走插件逻辑打印
          const lastItem = args.pop();
          const firstItem = lastItem.shift()
          if(firstItem === 'isPlugin') {
             originConsole.log(`我准备打印了`);
             lastItem.forEach((item: any,index: string | number) => {
              //@ts-ignore
              originConsole.log(`${item}=`, args[index])
             })
            originConsole.log(`----->打印结束<------`);
          }
        } else {
          //@ts-ignore
          result = func.apply(this, args);
        }
        return result;
    }
}
var console = new Proxy(window.console, {
    get(target, property) {
        return withLogging(target[property])
    },

})