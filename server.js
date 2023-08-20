const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { engine } = require('express-handlebars');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const flash = require('express-flash');

const indexRoutes = require('./src/routes');

dotenv.config();

const app = express();
const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: 'session',
})

store.on('error', function (error) {
    console.log(error);
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.engine('hbs', engine({ extname: 'hbs' }));
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(session({
    secret: process.env.SESSION_SECRET,
    store: store,
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

app.use('/', indexRoutes);

const port = process.env.PORT || 3000;

const connectDB = async () => {
    const mongoUri = process.env.MONGO_URI;
    try {
        mongoose.set('strictQuery', false)
        const connect = await mongoose.connect(mongoUri);

        console.log(`Connected to ${connect.connection.host}:${connect.connection.port}`);
    } catch (error) {
        console.log(error);
    }
}

app.listen(port, async () => {
    console.log(`Server running on port: ${port}`);
    await connectDB();
});