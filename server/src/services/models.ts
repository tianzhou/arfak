import { getModels } from './config.js';

export const modelHandlers = {
  async listModels() {
    const models = getModels().map(({ id, name, vendor, model }) => ({
      id,
      name,
      vendor,
      model,
    }));
    return { models };
  },
};
