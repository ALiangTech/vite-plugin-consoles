const originConsole = window.console;
function withLogging(func) {
    return function(...args) {
        let result = null;
        if(Array.isArray(args[args.length-1])) {
          // 走插件逻辑打印
          const lastItem = args.pop();
          const firstItem = lastItem.shift()
          originConsole.log(args, "kkkkk")
          if(firstItem === 'isPlugin') {
             originConsole.log(`%c----->我准备打印了<------`, "color: skyblue;padding: 2px");
             lastItem.forEach((item,index) => {
              originConsole.log(`${item.name} =`,args[index])
             })
            originConsole.log(`%c----->打印结束<------`, "color: skyblue;padding: 2px");
            originConsole.log(`\n`);
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