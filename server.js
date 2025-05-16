const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL bağlantısı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // MySQL kullanıcı adınızı buraya girin
    password: '12345678', // MySQL şifrenizi buraya girin
    database: 'spotify'
});

db.connect(err => {
    if (err) {
        console.error('MySQL bağlantısı başarısız:', err);
        process.exit(1); // Uygulamayı sonlandırır
    }
    console.log('MySQL bağlantısı başarılı...');
});

// Statik dosyaları sunmak için
app.use(express.static('public'));

// Endpoints
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Existing endpoint to get all albums
app.get('/albums', (req, res) => {
    let sql = 'SELECT * FROM albums';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// New endpoint to get an album by name
app.get('/album', (req, res) => {
    let name = req.query.name;
    let sql = 'SELECT * FROM albums WHERE album_name = ?';
    db.query(sql, [name], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
}); 

// Existing endpoint to get all artists
app.get('/artists', (req, res) => {
    let sql = 'SELECT * FROM artists';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// New endpoint to get an artist by name
app.get('/artist', (req, res) => {
    let name = req.query.name;
    let sql = 'SELECT * FROM artists WHERE artist_name = ?';
    db.query(sql, [name], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Existing endpoint to get all tracks
app.get('/tracks', (req, res) => {
    let sql = 'SELECT * FROM tracks';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// New endpoint to get a track by name
app.get('/track', (req, res) => {
    let name = req.query.name;
    let sql = 'SELECT * FROM tracks WHERE track_name = ?';
    db.query(sql, [name], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});
// Endpoint to get all distinct years from the 'album_dates' table
app.get('/albumYears', (req, res) => {
    let sql = 'SELECT DISTINCT released_year FROM album_dates';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results.map(result => result.released_year));
    });
});

// Endpoint to get all albums released in a specific year
app.get('/albumsByYear', (req, res) => {
    let year = req.query.year;
    let sql = 'SELECT albums.* FROM albums JOIN album_dates ON albums.album_id = album_dates.album_id WHERE album_dates.released_year = ?';
    db.query(sql, [year], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


// Endpoint to get the album for a specific track
app.get('/getAlbumForTrack', (req, res) => {
    let trackId = req.query.trackId;
    let sql = 'SELECT albums.* FROM albums JOIN tracks ON albums.album_id = tracks.album_id WHERE tracks.track_id = ?'; 
    db.query(sql, [trackId], (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});


app.post('/add-album', (req, res) => {
    let album = {
        album_id: req.body.albumId,
        album_name: req.body.albumName,
        album_popularity: req.body.albumPopularity,
        album_type: req.body.albumType,
        total_tracks: req.body.totalTracks,
        duration_sec: req.body.durationSec,
        duration_ms: req.body.durationMs
    };
    let sql = 'INSERT INTO albums SET ?';
    db.query(sql, album, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Albüm eklendi...');
    });
});


app.post('/add-track', (req, res) => {
    let track = {
        track_id: req.body.trackId,
        album_id: req.body.albumId,
        track_name: req.body.trackName,
        track_number: req.body.trackNumber,
        acousticness: req.body.acousticness,
        analysis_url: req.body.analysisUrl,
        danceability: req.body.danceability,
        energy: req.body.energy,
        instrumentalness: req.body.instrumentalness,
        liveness: req.body.liveness,
        loudness: req.body.loudness,
        speechiness: req.body.speechiness,
        tempo: req.body.tempo,
        time_signature: req.body.timeSignature,
        track_href: req.body.trackHref,
        uri: req.body.uri,
        valence: req.body.valence,
        track_popularity: req.body.trackPopularity
    };
    let sql = 'INSERT INTO tracks SET ?';
    db.query(sql, track, (err, result) => {
        if (err) {
            console.log(err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Şarkı eklendi...');
    });
});

app.post('/deleteAlbum', (req, res) => {
    let id = req.body.deleteId;
    let sql = `DELETE FROM albums WHERE album_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send('Album deleted...');
    });
});

app.post('/deleteTrack', (req, res) => {
    let id = req.body.deleteId;
    let sql = `DELETE FROM tracks WHERE track_id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.send('Track deleted...');
    });
});

app.post('/updateAlbum', (req, res) => {
    let id = req.body.updateId;
    let field = req.body.updateField;
    let value = req.body.updateValue;
    let sql = `UPDATE albums SET ${field} = ? WHERE album_id = ?`;
    db.query(sql, [value, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Album updated...');
    });
});


app.post('/updateTrack', (req, res) => {
    let id = req.body.updateId;
    let field = req.body.updateField;
    let value = req.body.updateValue;
    let sql = `UPDATE tracks SET ${field} = ? WHERE track_id = ?`;
    db.query(sql, [value, id], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Server error');
            return;
        }
        res.send('Track updated...');
    });
});


app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor...`);
});
 