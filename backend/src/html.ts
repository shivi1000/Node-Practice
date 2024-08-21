import handlebars from "handlebars";
import fs from "fs";
class HtmlTemplateMaker {

  async makeHtmlTemplate(HTMLTemplatePath: string, data: any) {
    let templateContent: string;
    try {
      console.log("<<<<<<<<>>>>>>>>>>>", HTMLTemplatePath);
      templateContent = fs.readFileSync(`${HTMLTemplatePath}`, "utf8");
    } catch (error) {
      console.error(error);
      throw error;
    }
    try {
      const template = handlebars.compile(templateContent, { noEscape: true });
      const mailBody = template(data);
      return mailBody;
    } catch (error) {
      throw error;
    }
  }
}
export const htmlTemplateMaker = new HtmlTemplateMaker();
