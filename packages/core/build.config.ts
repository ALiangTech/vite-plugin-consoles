import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  clean: true,
  entries: ['./src/index',{
    builder: 'mkdist',
    input: './src/script',
  }],
  declaration: false,
  failOnWarn: false,
  rollup: {
    emitCJS: true,
  },
})