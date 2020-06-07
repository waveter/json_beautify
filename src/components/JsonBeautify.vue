<template>
  <div class="body-container">
    <div class="input-div">
      <textarea
        class="input-textarea"
        name
        id
        cols="30"
        rows="10"
        placeholder="{}"
        v-model="inputData"
      ></textarea>
    </div>
    <div class="btn-container">
      <button class="btn-process" type="button" @click="handleProcessBtnClick()">Process</button>
    </div>
    <div class="output-section">
      <div class="output-json">
        <div v-for="line in listLine" :key="line.id">
          <div class="line-container" v-if="line.isShow && !line.isCloseBlock">
            <span class="line-number">{{line.lineNumber}}</span>
            <span class="indent-left" v-for="n in line.id.split('-').length - 2" :key="n">&nbsp;</span>
            <span
              v-for="(info, i) in line.info"
              :key="'A' + i"
              :class="'color-' + info.type"
            >{{info.text}}</span>
            <button
              class="collapse-icon"
              v-if="line.isExpand && line.isParentNode"
              @click="handleClickCollapseExpand(line, false)"
            >
              <i class="fa fa-minus" aria-hidden="true"></i>
            </button>
            <button
              class="expand-icon"
              v-if="!line.isExpand && line.isParentNode"
              @click="handleClickCollapseExpand(line, true)"
            >
              <i class="fa fa-plus" aria-hidden="true"></i>
            </button>
            <span
              class="color-square-bracket"
              v-if="!line.isExpand && line.isParentNode && line.text.indexOf('[') >= 0"
            >]</span>
            <span
              class="color-bracket"
              v-if="!line.isExpand && line.isParentNode && line.text.indexOf('{') >= 0"
            >}</span>
          </div>
          <div class="line-container" v-if="line.isShow && line.isCloseBlock">
            <span class="line-number">{{line.lineNumber}}</span>
            <span class="indent-left" v-for="n in line.id.split('-').length - 3" :key="n">&nbsp;</span>
            <span
              v-for="(info, i) in line.info"
              :key="'B' + i"
              :class="'color-' + info.type"
            >{{info.text}}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { LINE_TYPE } from "../constant/LineType.js";
export default {
  name: "JsonBeautify",
  props: {},
  data: function() {
    return {
      inputData: "",
      outputContent: "",
      listLine: [],
      loading: false
    };
  },
  methods: {
    handleClickCollapseExpand(item, isExpandBtn) {
      const checkId = item.id + "-";
      this.listLine.forEach(line => {
        if (line.id.indexOf(checkId) >= 0) {
          line.isShow = isExpandBtn;
          line.isExpand = isExpandBtn;
        }
      });
      item.isExpand = isExpandBtn;
    },
    handleProcessBtnClick() {
      this.$store.dispatch("setLoading", true);
      setTimeout(() => {
        let inputJson;
        try {
          inputJson = JSON.parse(this.inputData);
        } catch (e) {
          let errorMsg;
          if (this.inputData === "") {
            errorMsg = "Input is empty";
          } else {
            errorMsg = "Input is not valid JSON format";
          }
          this.$store.dispatch("setErrorMessage", errorMsg);
          this.$store.dispatch("setLoading", false);
          return;
        }
        const inputString = JSON.stringify(inputJson);
        const lines = this.splitInputJsonString(inputString);
        const catLines = this.categorizeLines(lines);
        this.setLineId(catLines);
        this.$store.dispatch("setLoading", false);
      }, 10);
    },
    categorizeLines(lines) {
      const result = [];
      for (const line of lines) {
        const tokens = line.split('":');
        if (tokens.length === 1) {
          if (line === "{" || line === "}") {
            const info = [{ text: line, type: LINE_TYPE.BRACKET }];
            result.push(info);
          } else if (line === "[" || line === "]") {
            const lastEl = result.pop();
            const lastVal = lastEl.pop();
            if (lastVal.type === LINE_TYPE.UNKNOWN) {
              const listEl = this.splitUnknownString(lastVal.text);
              for (const el of listEl) {
                const info = [el, { text: ",", type: LINE_TYPE.COMMA }];
                result.push(info);
              }
              if (line === "]") {
                const lastElinArr = result.pop();
                const lastValinArr = lastElinArr.pop();
                if (lastValinArr.type !== LINE_TYPE.COMMA) {
                  lastElinArr.push(lastValinArr);
                }
                result.push(lastElinArr);
              }
            } else {
              lastEl.push(lastVal);
              result.push(lastEl);
            }
            const info = [{ text: line, type: LINE_TYPE.SQUARE_BRACKET }];
            result.push(info);
          } else if (line === "],") {
            const lastEl = result.pop();
            const lastVal = lastEl.pop();
            if (lastVal.type === LINE_TYPE.UNKNOWN) {
              const listEl = this.splitUnknownString(lastVal.text);
              for (const el of listEl) {
                const info = [el, { text: ",", type: LINE_TYPE.COMMA }];
                result.push(info);
              }
              const lastElinArr = result.pop();
              const lastValinArr = lastElinArr.pop();
              if (lastValinArr.type !== LINE_TYPE.COMMA) {
                lastElinArr.push(lastValinArr);
              }
              result.push(lastElinArr);
            } else {
              lastEl.push(lastVal);
              result.push(lastEl);
            }
            const info = [
              { text: "]", type: LINE_TYPE.SQUARE_BRACKET },
              { text: ",", type: LINE_TYPE.COMMA }
            ];
            result.push(info);
          } else if (line === "},") {
            const info = [
              { text: "}", type: LINE_TYPE.BRACKET },
              { text: ",", type: LINE_TYPE.COMMA }
            ];
            result.push(info);
          } else {
            const lastEl = result.pop();
            const lastVal = lastEl.pop();
            if (lastVal.type === LINE_TYPE.SQUARE_BRACKET) {
              lastEl.push(lastVal);
              result.push(lastEl);
              const info = [{ text: line, type: LINE_TYPE.UNKNOWN }];
              result.push(info);
            } else {
              lastVal.text = lastVal.text + line;
              if (lastVal.type !== LINE_TYPE.UNKNOWN) {
                lastVal.type = LINE_TYPE.STRING;
              }
              lastEl.push(lastVal);
              result.push(lastEl);
            }
          }
        } else if (tokens.length === 2) {
          const key = { text: tokens[0] + '"', type: LINE_TYPE.KEY };
          const colon = { text: ":", type: LINE_TYPE.COLON };
          const valText = tokens[1].trim();
          const val = { text: valText, type: LINE_TYPE.NUMBER };
          let hasComma = false;
          if (valText[valText.length - 1] === ",") {
            val.text = valText.substring(0, valText.length - 1);
            hasComma = true;
          }

          if (val.text === "[") {
            val.type = LINE_TYPE.SQUARE_BRACKET;
          } else if (val.text === "{") {
            val.type = LINE_TYPE.BRACKET;
          } else if (val.text === "true" || val.text === "false") {
            val.type = LINE_TYPE.BOOLEAN;
          } else if (val.text[0] === '"') {
            val.type = LINE_TYPE.STRING;
          }
          if (hasComma) {
            const comma = { text: ",", type: LINE_TYPE.COMMA };
            result.push([key, colon, val, comma]);
          } else {
            result.push([key, colon, val]);
          }
        }
      }
      return result;
    },
    splitUnknownString(input) {
      const result = [];
      const tokens = input.split(",");
      for (const token of tokens) {
        if (token.length === 0) {
          continue;
        } else if (!isNaN(token)) {
          result.push({ text: token, type: LINE_TYPE.NUMBER });
        } else if (token === "true" || token === "false") {
          result.push({ text: token, type: LINE_TYPE.BOOLEAN });
        } else {
          if (token.indexOf('"') === 0) {
            result.push({ text: token, type: LINE_TYPE.STRING });
          } else {
            const lastEl = result.pop();
            result.push({
              text: lastEl.text + "," + token,
              type: LINE_TYPE.STRING
            });
          }
        }
      }
      return result;
    },
    splitInputJsonString(inputString) {
      let newlineString = "";
      for (const char of Array.from(inputString)) {
        if (["{", "[", ","].indexOf(char) >= 0) {
          newlineString += char + "\n";
        } else if (["}", "]"].indexOf(char) >= 0) {
          newlineString += "\n" + char;
        } else {
          newlineString += char;
        }
      }
      return newlineString.split("\n");
    },
    setLineId(catLines) {
      this.listLine = [];
      let currentId = "Id-0";
      let lineNumber = 0;
      for (const catLine of catLines) {
        lineNumber += 1;
        let line = "";
        for (const info of catLine) {
          line = line + info.text;
        }
        currentId = this.increaseLastOffset(currentId);
        const lineInfo = {
          info: catLine,
          text: line,
          id: currentId,
          isShow: true,
          isExpand: true,
          isParentNode: false,
          isCloseBlock: false,
          lineNumber: lineNumber
        };
        if (line.indexOf("[") >= 0 || line.indexOf("{") >= 0) {
          currentId = currentId + "-0";
          lineInfo.isParentNode = true;
        } else if (line.indexOf("]") >= 0 || line.indexOf("}") >= 0) {
          lineInfo.isCloseBlock = true;
          const tokens = currentId.split("-");
          tokens.pop();
          currentId = tokens.join("-");
        }
        this.listLine.push(lineInfo);
      }
    },
    increaseLastOffset(lineId) {
      const tokens = lineId.split("-");
      const lastChar = tokens[tokens.length - 1];
      tokens.pop();
      tokens.push(String(Number(lastChar) + 1));
      return tokens.join("-");
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.indent-left {
  width: 1em;
  display: inline-block;
}

.input-textarea {
  height: calc(100vh - 160px);
  width: 100%;
  margin: 1em 2em;
  overflow-y: auto;
  border: solid 2px #45a1de;
}

.output-json {
  height: calc(100vh - 160px);
  width: 100%;
  margin: 1em 2em;
  overflow-y: auto;
  text-align: left;
  border: solid 2px #45a1de;
  background-color: white;
}

.line-container {
  white-space: nowrap;
}

.btn-process {
  background-color: #45a1de;
  border-color: transparent;
  color: #fff;
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 0.5em;
  font-size: 20px;
  font-weight: 700;
}

.output-json > div {
  margin-left: 1em;
}

.body-container {
  display: flex;
  min-height: calc(100vh - 128px);
  background-color: #f9f4cb;
}

.input-div,
.output-section {
  flex-basis: 45vw;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
}

.btn-container {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-key {
  color: black;
}

.color-bracket {
  color: blue;
}

.color-square-bracket {
  color: blue;
}

.color-colon {
  color: blue;
  margin-right: 0.5em;
  margin-left: 0.2em;
  font-weight: bold;
}

.color-number {
  color: #ec2404;
}

.color-boolean {
  color: blueviolet;
}

.color-comma {
  color: blue;
}

.color-string {
  color: green;
}

.expand-icon,
.collapse-icon {
  margin-left: 2px;
  margin-right: 2px;
}

.line-number {
  display: inline-block;
  width: 2.5em;
  color: grey;
  -webkit-user-select: none; /* Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+/Edge */
  user-select: none; /* Standard */
}
</style>
