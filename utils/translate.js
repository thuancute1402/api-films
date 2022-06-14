const request = require("request-promise");

class Translator {
  constructor(dataCollection = [], keysObj = []) {
    this.dataCollection = dataCollection;
    this.keysObj = keysObj;
  }

  async translateReuslt() {
    const dataTranslate = await this.translateMicrosoft();
    const result = this.recoveryDataCollection(dataTranslate);
    return result;
  }

  translateMicrosoft() {
    const sen = this.collectionToParagrap();
    // const lang = vi ? "from=vi&to=en" : "from=en&to=vi";
    const lang = "from=en&to=vi";
    const url = `http://api.microsofttranslator.com/V2/Ajax.svc/Translate?appId=ABB1C5A823DC3B7B1D5F4BDB886ED308B50D1919&${lang}&text=${sen}`;
    const finalUrl = encodeURI(url);
    return new Promise((resolve, reject) => {
      request(finalUrl).then((data) => {
        if (data) {
          resolve(data.replace(/"/g, ""));
        } else {
          reject("😃 No result");
        }
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  translateViki(dataCollection = []) {
    const sen = this.collectionToParagrap(dataCollection);
    let lang = this.detectVi(sen) ? "src=vi&tgt=en" : "src=en&tgt=vi";
    const url = "https://vikitranslator.com/divaba";
    const options = {
      method: "POST",
      uri: url,
      headers: {
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
      body: `key=testkey&${lang}&vb=${sen}`,
    };
    return new Promise((resolve, rejects) => {
      request(options).then((data) => {
        if (data) {
          resolve(data);
        } else {
          rejects("No result");
        }
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  collectionToParagrap() {
    let paragrap = "";
    this.dataCollection.map((item, index) => {
      this.keysObj.map((key, indexKey) => {
        paragrap +=
          item[key] + (indexKey === this.keysObj.length - 1 ? "" : " ; ");
      });
      paragrap += index === this.dataCollection.length - 1 ? "" : " * ";
    });

    return paragrap;
  }

  recoveryDataCollection(dataTranslate) {
    const data = dataTranslate.split("*").map((val) => {
      let _obj = {};
      const splitText = val.split(";");

      this.keysObj.map((key, index) => (_obj[key] = splitText[index]));
      return _obj;
    });
    return data;
  }

  detectVi(word) {
    const vi = [
      "aàảãáạăằẳẵắặâầẩẫấậ",
      "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
      "dđ",
      "DĐ",
      "eèẻẽéẹêềểễếệ",
      "EÈẺẼÉẸÊỀỂỄẾỆ",
      "iìỉĩíị",
      "IÌỈĨÍỊ",
      "oòỏõóọôồổỗốộơờởỡớợ",
      "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
      "uùủũúụưừửữứự",
      "UÙỦŨÚỤƯỪỬỮỨỰ",
      "yỳỷỹýỵ",
      "YỲỶỸÝỴ",
    ];

    for (let i = 0; i < vi.length; i++) {
      const sub = vi[i].substr(1);
      const rex = new RegExp("[" + sub + "]", "g");
      if (rex.test(word)) return true;
    }
    return false;
  }
}

module.exports = Translator;
