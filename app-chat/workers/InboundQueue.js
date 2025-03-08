import { Job } from "@bootloader/core/decorators";
import { ChatBox, ScriptBox, Snippets, MessageBox, MessageBoxCWC } from "./../../@core/scriptus";

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
      message: new MessageBoxCWC({ message: task, contact_id }),
    }).execute();
  }
}
