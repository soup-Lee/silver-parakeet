import Loader from "./loader";
import { externalLinks } from "./cdn";
import parserHTML from "prettier/parser-html";
import parserMarkdown from "prettier/parser-markdown";
import parserCSS from "prettier/parser-postcss";
import parserJavaScript from "prettier/parser-babel";
import { format as codeformat } from "prettier";
import { js } from "js-beautify";
const formatOptions = {
  printWidth: 80, // 一行首选字符数
  tabWidth: 2, // tab对应空格数
  useTabs: false, // 使用tab替换空格
  semi: true, // 分号结尾
  singleQuote: false, // 单引号
  trailingComma: "es5", // 尾随逗号
  bracketSpacing: true, // 在对象文字中的括号之间打印空格，如{ foo: bar }
  bracketSameLine: false, // 多行 HTML 标签开头的 > 放在最后一行的末尾而不是单独放在下一行
  arrowParens: "always", // 在唯一的箭头函数参数周围包含括号
  endOfLine: "auto", // 行尾风格
};

function changeFormatOptions(newOption) {
  formatOptions[newOption.attr] = newOption.val;
}

const loader = new Loader();

const parserMap = {
  HTML: "html",
  Markdown: "markdown",
  CSS: "css",
  Sass: "scss",
  Scss: "scss",
  Less: "less",
  Stylus: "css",
  JavaScript: "babel",
  TypeScript: "typescript",
  CoffeeScript: "babel",
  JSX: "babel",
};

const pluginMap = {
  HTML: parserHTML,
  Markdown: parserMarkdown,
  CSS: parserCSS,
  Sass: parserCSS,
  Scss: parserCSS,
  Less: parserCSS,
  Stylus: parserCSS,
  JS: parserJavaScript,
  TypeScript: null,
  CoffeeScript: parserJavaScript,
  JSX: parserJavaScript,
};

/**
 * 对于TypeScript的格式化插件使用外部cdn链接引入
 * 这是因为该插件文件过大而为之
 */
loader.loadScript(externalLinks.formatLinks.typeScript).then(() => {
  pluginMap.TypeScript = window.prettierPlugins.typescript;
});

/**
 * Format code
 * @param {String} code
 * @param {String} mode
 * @returns {String}
 */
function format(code: string, mode: string): string {
  let parser = parserMap[mode];
  let plugin = pluginMap[mode];
  if (plugin === null) {
    return code;
  }
  if (!loader.has("format")) {
    const format = codeformat;
    loader.set("format", format);
  }
  let result = code;
  try {
    result = loader.get("format")(code, {
      ...formatOptions,
      parser,
      plugins: [plugin],
    });
  } catch (err) {
    console.log("format error:", err);
  }
  return result;
}

/**
 * Use js-beautify instead of prettier to format console code
 * 使用更轻巧的 js-beautify 代替 prettier 格式化 console 中输出的代码
 * @param {String} code
 * @returns {String}
 */
function simpleFormat(code: string): string {
  if (!loader.get("formatJS")) {
    const formatJS = js;
    loader.set("formatJS", formatJS);
  }
  return loader.get("formatJS")(code, {
    indent_size: 2, // tab缩进数
    indent_level: 0, // 缩进等级
    space_in_empty_paren: true,
    preserve_newlines: true, // 元素前的换行是否被允许存在
  });
}

export { changeFormatOptions, format, simpleFormat };
