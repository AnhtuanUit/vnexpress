const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test', { useNewUrlParser: true });
require('./models/articles');
const Puppeteer = require('./helper/puppeteer');
const topics = require('./config/config');

const start =  async () => {
    for(var topic of topics) {
        await Puppeteer.scrape(topic).then((article) => {
            return loadArticles(topic);
        });
    };
    }


const loadArticles = async (topic) => {
    await Puppeteer.doSomething(topic);
}

start();
