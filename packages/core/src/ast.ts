import * as recast from "recast";

// 当节点类型是 CallExpression 返回节点执行的 名称+()

function getCallExpressName(node) {
  if (node.type === "CallExpression") {
    return `${node.callee.name}()`;
  }
}

function isBinary(node) {
  return node.type === "BinaryExpression";
}
// 当节点类型是 BinaryExpression 返回节点 left+operator+right 组合成的名称
function getBinaryExpressionName(node) {
  if (node.type === "BinaryExpression") {
    const { left, operator, right } = node;
    const leftName = isBinary(left)
      ? getBinaryExpressionName(left)
      : getNameByType(left);
    const rightName = isBinary(right)
      ? getBinaryExpressionName(right)
      : getNameByType(right);
    return `${leftName}${operator}${rightName}`;
  }
}

// 根据节点类型 获取节点name

function getNameByType(node) {
  const { type } = node;
  let name = "";
  switch (type) {
    case "Identifier":
      name = node.name;
      break;
    case "CallExpression":
      name = getCallExpressName(node);
      break;
    case "Literal":
      name = node.value;
      break;
    case "BinaryExpression":
      name = getBinaryExpressionName(node);
      break;
  }
  return name;
}

const builders = recast.types.builders;
export default function addArgumentToConsoleLog(code) {
  const ast = recast.parse(code);
  recast.visit(ast, {
    visitCallExpression(path) {
      const { node } = path;
      // 检查是否是console.log() 函数调用
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.object.name === "console" &&
        node.callee.property.name === "log"
      ) {
        // 是console.log 函数调用 则 给log 函数添加参数
        let waitAddArgs = node.arguments.map((item) => {
          const { type } = item;
          const name = getNameByType(item);
          const typeBuild = builders.objectProperty(
            builders.identifier("type"),
            builders.literal(type)
          );
          const nameBuild = builders.objectProperty(
            builders.identifier("name"),
            builders.literal(name)
          );
          return builders.objectExpression([typeBuild, nameBuild]);
        });
        // isPlugin
        waitAddArgs = builders.arrayExpression([
          builders.literal("isPlugin"),
          ...waitAddArgs,
        ]);
        node.arguments.push(waitAddArgs);
      }
      return false;
    },
  });
  return recast.print(ast).code;
}
