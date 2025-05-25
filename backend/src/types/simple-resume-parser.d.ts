declare module "simple-resume-parser" {
  class ResumeParser {
    constructor(resume: Buffer | string, options?: any);
    parseToJSON(): Promise<any>;
    parseToFile(outputPath: string): Promise<void>;
  }

  export = ResumeParser;
}
