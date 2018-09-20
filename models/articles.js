const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const topics = require('../config/config');

function ArticleSchema (add, collection) {
    var schema = new Schema({
        title: String,
        description: String,
        content_detail: Array,
        author_mail: String,
        time: String,
        box_brief_info: Array,
        type: Array, // thoiso, thegioi, kinhdoanh, giaitri, thethao, phapluat, giaoduc, suckhoe, doisong, dulich, khoahoc, sokhoa, xe, congdong, tamsu, Cuoi,    });
        href: String
    }, {collection});

    if(add) {
        schema.add(add);
    }

    return schema;
}

for(var topic of topics) {
    mongoose.model(topic.type, ArticleSchema(null, topic.type));
}