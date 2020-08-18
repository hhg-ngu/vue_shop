//发布阶段用的插件
const prodPlugins = [];
//判断是否是发布模式
if (process.env.NODE_ENV === "production") {
  prodPlugins.push("transform-remove-console");
}

module.exports = {
  presets: ["@vue/cli-plugin-babel/preset"],
  plugins: [
    [
      "component",
      {
        libraryName: "element-ui",
        styleLibraryName: "theme-chalk",
      },
    ],
    //发布时使用的插件
    ...prodPlugins,
  ],
};
