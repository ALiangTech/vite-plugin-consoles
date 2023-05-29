# vite-plugin-consoles

## 功能

- 打印输出对应的 变量名称

  ```javascript
    const test = { name: 'kk'}
    console.log(test.name) // 控制台输出 test.name = kk
  ```


## 安装

```bash
  pnpm add vite-plugin-consoles -D
```

## 使用

  ```javascript
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   import vitePluginConsole  from 'vite-plugin-consoles'
   // https://vitejs.dev/config/
   export default defineConfig({
   plugins: [vue(), vitePluginConsole()],
   })
  ```


### 如果要使用系统的console 请使用originConsole

```javascript 
originConsole.log()  // 等价于console.log
```
