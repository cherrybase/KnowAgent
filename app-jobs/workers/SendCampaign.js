import { Job } from "@bootloader/core/decorators";

const TASKS = [{}, {}, {}, {}];

@Job({ name: "sendCampaign", workers: 4 })
export default class SendCampaignJob {
  async read({ job }) {
    console.log(`reading`, job);
    return [TASKS.pop(), TASKS.pop()]
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async execute({ task }) {
    console.log(`executing:`, task);
    await this.sleep(5000);
  }
}
