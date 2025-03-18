// const utils = require("../utils");
// const dbservice = require("../service/dbservice");
// const TokenKeysScheme = require("../model/token_keys_schema");
// const token_keys_service = require("../service/token_keys_service");
const { requireOptional } = require("@bootloader/utils");

const TokenKeysStore = require("../store/TokenKeysStore");

const { OpenAI, AzureOpenAI } = requireOptional("openai");
// const azureOpenAi = require("@azure/openai"); // {AzureKeyCredential}
// const { AzureKeyCredential } = require("@azure/openai"); // {AzureKeyCredential}
const azureIdentity = requireOptional("@azure/identity"); //{ ClientSecretCredential }

// const { DEFAULT_INTENT_SERVICE_KEY } = require("../service/settings");
const DEFAULT_INTENT_SERVICE_KEY = "DEFAULT_INTENT_SERVICE_KEY";

module.exports = function (
  $,
  { server, tnt, app_id, domain, contact_id, channel_id, session, userData, inbound, execute, setting, domainbox }
) {
  function openai(_options) {
    // $.openai = function (_options) {
    let openaiDomainBox = domainbox.context("snippet.openai");
    let options = _options || setting(DEFAULT_INTENT_SERVICE_KEY);
    let key = (typeof options == "string" ? options : options?.key) || undefined;
    async function getConfig() {
      return await TokenKeysStore.get({
        domain,
        type: "gpt",
        key: key,
      });
    }
    // let tokenKeys = dbservice.getModel(domain,'CONFIG_TOKEN_KEYS',TokenKeysScheme);
    // let findToken = tokenKeys.findOne({
    //     type : "wit", disbaled : false
    // });
    return {
      // then(cb){
      //     return findToken.then(cb);
      // },
      async chat_completions_create(a, ...args) {
        let doc = await getConfig();
        //console.log("doc===",_options,"====",doc)
        if (doc?.value?.provider == "AZURE") {
          if (doc.value.azure.authType == "SECRET") {
            const azureCredential = new azureIdentity.ClientSecretCredential(
              doc?.value?.azure?.tenantId,
              doc?.value?.azure?.clientId,
              doc?.secret?.azure?.clientSecret
            );
            const azureADTokenProvider = async () => {
              let token = await openaiDomainBox.get("token");
              if (!token) {
                let tokenResp = await azureCredential.getToken("https://cognitiveservices.azure.com/.default");
                token = tokenResp.token;
                if (token) {
                  await openaiDomainBox.set("token", token, { ttl: 45 * 60 });
                }
              }
              return token;
            };
            return new AzureOpenAI({
              azureADTokenProvider,
              azureEndpoint: doc?.value?.azure?.endpoint,
            });
          } else if (doc.value.azure.authType == "TOKEN") {
          } else {
            let deployment = doc.value?.azure?.deployment || "gpt-3.5-turbo";
            let apiVersion = doc.value?.azure?.apiVersion || "2024-10-01";
            // for  "@azure/openai": "^1.0.0-beta",
            // return await new azureOpenAi.OpenAIClient(
            //     doc.value?.azure?.endpoint,
            //     new azureOpenAi.AzureKeyCredential(doc.secret?.azure?.apiKey)
            // ).getCompletions(deployment,a.messages);
            return await new AzureOpenAI({
              apiKey: doc.secret?.azure?.apiKey,
              endpoint: doc.value?.azure?.endpoint,
              deployment: deployment,
              apiVersion: apiVersion,
            }).chat.completions.create(a, ...args);
          }
        } else if (doc?.secret?.apiKey) {
          let model = doc?.value?.model || "gpt-3.5-turbo";
          //console.log("=====",a,args)
          return await new OpenAI({
            apiKey: doc?.secret?.apiKey,
            //logger: new log.Logger(log.INFO)
          }).chat.completions.create(
            {
              model: model,
              ...a,
            },
            ...args
          );
        } else {
          throw "Error ( No OpenAI Provider )";
        }
      },
      async next(messages, functions) {
        try {
          let response = await this.chat_completions_create({
            messages: (
              messages || [
                {
                  role: "system",
                  content: "You are an Agent Who is curious about user's issue and wants to solve it.",
                },
              ]
            ).filter((message) => message.content && message.content.trim() !== ""),
            functions: functions,
            function_call: functions && functions.length ? "auto" : undefined,
            max_tokens: 200,
            temperature: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
          });

          //console.log("response:",response)
          return {
            localChoice: {},
            isError() {
              return false;
            },
            getRaw: function () {
              return response;
            },
            choices: response?.choices,
            message: function (index) {
              index = index || 0;
              return response?.choices?.[index]?.message;
            },
            is(funName) {
              return response?.choices?.[0]?.function_call == funName;
            },
            function_call(callback) {
              let function_call = null;
              try {
                function_call = callback({
                  content: this.message().content,
                });
              } catch (e) {
                console.error(e);
              }
              if (function_call && function_call.name) {
                this.localChoice.function_call = function_call;
              }
              return this;
            },
            function_call_used: "",
            on(funName, callback) {
              try {
                let function_call = this.localChoice.function_call || this.message().function_call;
                if (typeof funName == "string") {
                  if (!function_call) return this;
                  const { name, args } = function_call;
                  if (funName == name || (!this.function_call_used && funName == "*")) {
                    this.function_call_used = funName;
                    callback({
                      name: name,
                      args: (typeof args == "string" ? JSON.parse(args) : args) || {},
                      content: this.message().content,
                    });
                  }
                } else if (typeof funName == "function" && !function_call?.name) {
                  funName({
                    content: this.message().content,
                  });
                }
              } catch (e) {
                console.error("ERROR", e);
              }
              return this;
            },
          };
        } catch (e) {
          $.logger.error(e);
          //console.error("======",e);
          return {
            isError() {
              return true;
            },
            error() {
              return e?.error;
            },
            message() {
              return "";
            },
          };
        }
      },
    };
  }

  openai.chat = {
    completions: {
      async create(a, ...args) {
        return await openai().chat_completions_create(
          {
            max_tokens: 200,
            temperature: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            ...a,
          },
          ...args
        );
      },
    },
  };

  openai.next = async function (messages, functions) {
    return await openai().next(messages, functions);
  };

  return openai;
};
