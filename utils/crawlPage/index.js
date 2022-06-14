const schedule = require("node-schedule");
const puppeteer = require("puppeteer");
const Film = require("../../models/Film");

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
};

const evaluate = () => {
  const tdQuery = document.querySelectorAll("td");
  const imgsQuery = document.querySelectorAll(".rounded-md");

  const dataTd = [],
    dataImg = [];

  tdQuery.forEach((item) => {
    dataTd.push(item.textContent);
  });
  imgsQuery.forEach((item) => {
    const src = item.getAttribute("srcset");
    if (src) {
      dataImg.push(src.slice(0, src.indexOf(",")));
    }
  });

  return {
    dataTd,
    dataImg,
  };
};

// /10 * * * * *
const crawlFilms = () =>
  schedule.scheduleJob("*/1 * * * *", async () => {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1300, height: 1000 });
    await page.goto(`https://ophim.cc/danh-sach/phim-moi?page=1`, {
      waitUntil: "load",
    });
    // wait for scroll to end page
    await autoScroll(page);
    const { dataTd, dataImg } = await page.evaluate(evaluate);
    const filmModel = [
      "name",
      "year",
      "status",
      "category",
      "country",
      "modified",
    ];

    // handle data crawl without: originName and imgUrl field
    const resTemp = [];
    for (let i = 0; i < dataTd.length; i += filmModel.length) {
      let indexKey = i,
        rowObj = {};
      filmModel.map((key) => (rowObj[key] = dataTd[indexKey++]));
      resTemp.push(rowObj);
      indexKey = 1;
      rowObj = {};
    }
    // add
    const result = resTemp.map((val, index) => {
      const regex = /[()]/g;
      const originName = val.name
        .slice(val.name.lastIndexOf("("))
        .replace(regex, "");
      const name = val.name.slice(0, val.name.indexOf("("));

      return {
        ...val,
        name,
        originName,
        imgUrl: "https://ophim.cc/" + dataImg[index],
      };
    });
    await Film.insertMany(result);
    console.log(result);
    browser.close();
  });
module.exports = crawlFilms;
