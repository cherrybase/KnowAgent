import { Job } from "@bootloader/core/decorators";
import { ChatBox } from "./../../@core/scriptus";
import { XMSAdapeter, LocalAdapeter } from "./../../@core/scriptus/adapters";

ChatBox.load({
  dir: "../",
});

@Job({ name: "inboundQueue", workers: 4 })
export default class InboundQueue {
  async read({ job }) {
    console.log(`reading`, job);
  }

  async execute({ task, queue }) {
    const contact_id = queue;
    new ChatBox({
      adapter: new LocalAdapeter({ message: task, contact_id }),
    }).execute();
  }
}
