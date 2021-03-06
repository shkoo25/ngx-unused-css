import FindHtml from "./../helpers/findHtml";
import FindUnusedCss from "./findUnusedCss";
const fs = require("fs");

export default class UnusedClasses {
  private allHtmlContent = "";

  async unusedClassMapper(
    cssPath: string,
    htmlContent: string,
    htmlPath: string
  ) {
    try {
      fs.readFileSync(cssPath);
      try {
        const classes = await new FindUnusedCss().findUnusedCss(
          htmlContent,
          cssPath
        );
        return [classes, htmlPath];
      } catch (error) {}
    } catch (error) {
      console.log(
        "Styling file for component " + htmlPath + " not found, skipping..."
      );
    }
  }

  mapClasses(list: any) {
    const promiseArray = list.map(element => {
      const htmlPath = element;
      const htmlContent = fs.readFileSync(htmlPath, "utf8");
      const cssPath = htmlPath.replace(".html", ".scss"); // same path as html but css means it is component

      this.allHtmlContent += htmlContent;

      return this.unusedClassMapper(cssPath, htmlContent, htmlPath);
    });
    return Promise.all(promiseArray);
  }

  getUnusedClasses(projectPath: string): Promise<[string[], string]> {
    const list = new FindHtml().findHtml(projectPath);
    return this.mapClasses(list).then(r => {
      return r.filter(c => c[0].length > 0);
    }) as Promise<[string[], string]>;
  }

  getGlobalUnusedClasses(globalStyles: string) {
    const classes = new FindUnusedCss().findUnusedCss(
      this.allHtmlContent,
      globalStyles
    );
    return classes;
  }
}
