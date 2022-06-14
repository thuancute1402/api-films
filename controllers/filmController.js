const puppeteer = require("puppeteer");
const catchAsync = require("../middlewares/catchAsync");
const Film = require("../models/Film");
const { removeVietnameseTones } = require("../helpers/helper");
const { default: axios } = require("axios");

// crawler
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

exports.crawlFilm = catchAsync(async (req, res) => {
  const { pageNum } = req.query;
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1300, height: 1000 });
  await page.goto(`https://ophim.cc/danh-sach/hoat-hinh?page=${pageNum}`, {
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
      slug: removeVietnameseTones(name.trim()),
    };
  });
  const filterFilnm = result.filter((val) => {
    const indexSex = val.category.toLowerCase().indexOf("phim 18+"),
      indexHorror = val.category.toLowerCase().indexOf("kinh dị");
    return indexSex === -1 && indexHorror === -1;
  });
  await Film.insertMany(filterFilnm);
  console.log(filterFilnm);
  browser.close();

  res.status(200).json({
    success: true,
    data: filterFilnm,
  });
});
// crawler

exports.getFilms = catchAsync(async (req, res) => {
  const { page, limit } = req.query;
  const total = await Film.count();
  // if(page)
  const fimls = await Film.find({})
    .skip(page * limit)
    .limit(limit);

  res.status(200).json({
    success: true,
    data: fimls,
    pageInfor: {
      total: total,
      currentPage: +page,
      pageSize: +limit,
    },
  });
});

exports.detailFilm = catchAsync(async (req, res) => {
  const { slug } = req.params;
  const { data } = await axios.get(`https://ophim1.com/phim/${slug}`);
  res.status(200).json({
    success: true,
    data,
  });
});

exports.getCategories = catchAsync(async (req, res) => {
  const films = await Film.find({});
  res.status(200).json({
    success: true,
    data: films,
  });
});

exports.deleteAll = catchAsync(async (req, res) => {
  await Film.deleteMany({});
  res.status(200).json({
    success: true,
    message: "film collection has been deleted successfully",
  });
});
