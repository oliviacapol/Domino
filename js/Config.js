class Config {
  constructor() {
    this.OPEN_AI_KEY = `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`;
    // GPT-4 cost $0.44
    // GPT-3.5 Turbo $0.03
    this.TEXT_MODEL = `gpt-3.5-turbo`;
    // dall-e-3 cost $0.24
    // dall-e-2cost $?
    this.IMAGE_MODEL = `dall-e-3`;
  }
}
export default new Config();
