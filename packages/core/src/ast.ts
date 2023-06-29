import * as recast from "recast";
import { namedTypes } from "ast-types";
import { ExpressionKind } from "ast-types/gen/kinds";

export type ArgumentItem = ExpressionKind | namedTypes.SpreadElement;

// 判断节点是否是console.log()
function isConsoleLogNode(node: recast.types.namedTypes.CallExpression) {
  if (node.callee.type === "MemberExpression") {
    const { object, property } = node.callee;
    if (
      object.type === "Identifier" &&
      object.name === "console" &&
      property.type === "Identifier" &&
      property.name === "log"
    ) {
      return true;
    }
  }
  return false;
}

// 获取console.log()的参数
function getConsoleLogParams(params: ArgumentItem) {
  const { loc } = params;
  let name = "";
  if (loc) {
    const { start, end, tokens } = loc;
    const paramTokens = tokens.slice(start.token, end.token);
    name = paramTokens.map(({ value }) => value).join("");
  }
  return name;
}

const builders = recast.types.builders;
export default function addArgumentToConsoleLog(code: string) {
  const ast = recast.parse(code);
  recast.visit(ast, {
    visitCallExpression(path) {
      const { node } = path;
      const isConsolelog = isConsoleLogNode(node);
      if (isConsolelog) {
        // 是console.log 函数调用 则 给log 函数添加参数
        const waitAddArgs = node.arguments.map((item) => {
          const { type } = item;
          const param = getConsoleLogParams(item as ArgumentItem);

          builders.p;
          const typeBuild = builders.objectProperty(
            builders.identifier("type"),
            builders.literal(type)
          );
          const nameBuild = builders.objectProperty(
            builders.identifier("name"),
            builders.literal(param)
          );
          return builders.objectExpression([typeBuild, nameBuild]);
        });
        const newNodeArguments = builders.arrayExpression([
          builders.literal("isPlugin"),
          ...waitAddArgs,
        ]);
        node.arguments.push(newNodeArguments);
      }
      return false;
    },
  });
  return recast.print(ast).code;
}
