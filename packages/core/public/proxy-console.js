const originConsole = window.console;
function withLogging(func) {
    return function(...args) {
        let result = null;
        if(Array.isArray(args[args.length-1])) {
          // 走插件逻辑打印
          const lastItem = args.pop();
          const firstItem = lastItem.shift()
          if(firstItem === 'isPlugin') {
<<<<<<< Updated upstream
            originConsole.log(`\n`);
=======
>>>>>>> Stashed changes
             lastItem.forEach((item,index) => {
              originConsole.log(`${item} =`,args[index])
             })
<<<<<<< Updated upstream
            originConsole.log(`\n`);
=======
             originConsole.groupEnd();
>>>>>>> Stashed changes
          }
        } else {
          result = func.apply(this, args);
        }
        return result;
    }
}

var console = new Proxy(window.console, {
    get(target, property) {
        if(property === 'log') {
          return withLogging(target[property])
        }
        return target[property]
    },
})