import { Job } from "@bootloader/core/decorators";
import { ChatBox } from "./../../@core/scriptus";
import { XMSAdapter, LocalAdapter } from "./../../@core/scriptus/adapters";

ChatBox.load({
  dir: "../",
});

@Job({ name: "inboundQueue", workers: 4 })
export default class InboundQueue {
  async read(job, {}) {
    console.log(`reading`, job);
  }

  async execute(task, { queue }) {
    console.log("InboundQueue > execute", { task, queue });

    const contact_id = queue;
    new ChatBox({
      adapter: task.meta
        ? new XMSAdapter({ message: task, contact_id })
        : new LocalAdapter({ message: task, contact_id }),
    }).execute();
  }
}
