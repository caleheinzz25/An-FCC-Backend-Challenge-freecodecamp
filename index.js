require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dns = require('dns');
const urlParser = require('url');
const app = express();

mongoose.connect(process.env.URL_DB, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Berhasil terhubung ke database');
    })
    .catch(err => {
        console.error('Error saat terhubung ke database', err);
    });

const urlsSchema = new mongoose.Schema({
    url: { type: String, unique: true },
    short_url: Number
});

const Url = mongoose.model('urls', urlsSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
    res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
    const url = req.body.url;

    dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
        if (err || !address) {
            return res.json({ error: "Invalid URL" });
        }

        try {
            const urlCount = await Url.countDocuments({});
            const newShortUrl = urlCount + 1;

            const urlDoc = new Url({
                url: url,
                short_url: newShortUrl
            });

            const result = await urlDoc.save();
            res.json({ original_url: result.url, short_url: result.short_url });
        } catch (error) {
            if (error.code === 11000) { // Error code for duplicate key
                const existingUrl = await Url.findOne({ url });
                res.json({ original_url: existingUrl.url, short_url: existingUrl.short_url });
            } else {
                res.status(500).json({ error: 'Error saat menyimpan URL' });
            }
        }
    });
});

app.get('/api/shorturl/:short_url', async (req, res) => {
    const shortUrlParam = parseInt(req.params.short_url); // Ubah ke integer

    try {
        const urlDoc = await Url.findOne({ short_url: shortUrlParam });

        if (urlDoc) {
            // Redirect ke URL asli jika ditemukan
            res.redirect(urlDoc.url);
        } else {
            // Jika tidak ditemukan, kirim respons error
            res.json({ error: 'Short URL tidak ditemukan' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Error saat mencari URL' });
    }
});

app.listen(port, function() {
    console.log(`Listening on port http://localhost:${port}`);
});
