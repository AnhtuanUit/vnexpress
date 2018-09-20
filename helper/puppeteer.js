const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
let arr = [];

const scrape =  async (topic) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();

    await page.goto('https://vnexpress.net/');
    await page.click('#header > div > div.btn_control_menu > i');
    await page.waitFor(1000);
    await page.focus(topic.element)
    await page.waitFor(1000);
    await page.click(topic.element);
    await page.waitFor(1000);

    const result = await page.evaluate(() => {
        let data = []; // Create an empty array that will store our data
        let elements = document.querySelectorAll('body section.sidebar_1 > article > h3 > a:first-child'); // Select all Products

        for (var element of elements){ // Loop through each proudct
            let href = element.getAttribute('href'); // Select the title
            data.push(href); // Push an object with the data onto our array
        }

        return data; // Return our data array
    });

    browser.close();
    arr = result;
    return result; // Return the data
};


const scrapeArticle = async (href) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    console.log('Go to href:', href);
    try {
        await page.goto(href);
    } catch (e) {

    }

    const result = await page.evaluate(() => {
        let time = document.querySelector('section.container header > span.time'); // Select time
        let title = document.querySelector('h1.title_news_detail'); // Select title
        let description = document.querySelector('h2.description'); // Select description
        let author_mail = document.querySelector('body > section.container > section.wrap_sidebar_12 > section.sidebar_1 > p.author_mail');
        let box_brief_info = document.querySelectorAll('body > section.container > section.wrap_sidebar_12 > section.sidebar_1 > article > .box_brief_info p');
        time = time && time.innerText;
        title = title && title.innerText;
        description = description && description.innerText;
        author_mail = author_mail && author_mail.innerText;

        let contents = document.querySelectorAll('body > section.container > section.wrap_sidebar_12 > section.sidebar_1 > article > p:not(.author_mail), table'); // Select all contents
        let arrayContents = [];
        let arrayBoxBriefInfo = [];

        for (var element of contents){ // Loop through each proudct
            if(element) {
                if(element.tagName.toLocaleLowerCase() === 'p') {
                    let text = element.innerText; // Select the title
                    arrayContents.push(text); // Push an object with the data onto our array
                }

                else if(element.tagName.toLocaleLowerCase() === 'table') {
                    let img = element.querySelector('tbody > tr:nth-child(1) > td > img'); // Select the title
                    let description = element.querySelector('tbody > tr:nth-child(2) > td > p'); // Select the title
                    if(img) {
                        img = img.getAttribute('src');
                    }
                    if(description) {
                        description = description.innerText;
                    }
                    arrayContents.push({img, description}); // Push an object with the data onto our array
                }
            }
        }
        for (var element of box_brief_info){ // Loop through each proudct
            if(element) {
                if(element.tagName.toLocaleLowerCase() === 'p') {
                    let text = element.innerText; // Select the title
                    arrayBoxBriefInfo.push(text); // Push an object with the data onto our array
                }
            }
        }

        return {time, title, description, content_detail: arrayContents, author_mail, box_brief_info: arrayBoxBriefInfo }; // Return our data array
    });

    browser.close();
    return result; // Return the data
};

function handleElement(number){
    return new Promise((resolve, reject) => {
        return resolve(number);
    });
}

function doSomething(topic, index = 0){
    return new Promise((resolve, reject) => {
        handleElement(arr[index])
            .then((href) => {
                return scrapeArticle(href)
                    .then(objArticle => {
                        const article = mongoose.model(topic.type)({...objArticle, type: topic.type, href});
                        article.save()
                            .then(() => console.log('meow'))
                            .catch(err => console.log('err', err))
                        if (index < arr.length - 1) {
                            return doSomething(topic, index + 1);
                        } else {
                            return 'done'
                        }
                    })
            })
            .then((final) => {
                console.log('final', final);
                resolve('done');
            })
            .catch(reject);
    });
}

module.exports = {
    scrape,
    doSomething
};