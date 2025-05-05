import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

const reservations = [];
const USERS = [
    { username: "user1", password: "pass1", admin: true },
    { username: "user2", password: "pass2", admin: false }
];const films = [
    {id: 1, name: "film1", length: "120 minutes" },
    {id: 2, name: "film2", length: "180 minutes" },
    {id: 3, name: "film3", length: "150 minutes" },
    {id: 4, name: "film4", length: "120 minutes" },
    {id: 5, name: "film5", length: "180 minutes" }
];

const checkAuth = (req, res, next) => {
    const { username, password } = req.body;
    const user = USERS.find(user => user.username === username && user.password === password);
    if (user) {
        next();
    } else {
        res.status(401).json({ message: "Unauthorized" });
    }
};

const checkadmin = (req, res, next) => {
    const user = USERS.find(user => user.username === req.body.username);
    if (user && user.admin) {
        next();
    } else {
        res.status(403).json({ message: "Forbidden: access denied" });
    }
};

app.get('/films', checkAuth, (req, res) => {
    try {
      res.json(films);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving films", error: error.message });
    }
});

app.get('/reservations', checkAuth, checkadmin, (req, res) => {
    try {
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving reservations", error: error.message });
    }
});

app.get('/films/:id', checkAuth, (req, res) => {
    try {
      const id = parseInt(req.params.id)
      const film = films.find(film => film.id === id);
      if (film) {
        res.json(film);
      } else {
        res.status(404).json({ message: "Film not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error retrieving films", error: error.message });
    }
});

app.post('/films', checkAuth, checkadmin, (req, res) => {
    try {
    const { name, length } = req.body;
    
    if(!name || !length){
        return res.status(400).json({ message: "Film name and length are required" });
    }

    if(films.some(film => film.name === name)) {
        return res.status(409).json({ message: "Film name already exists" });
    }

    const newId = Math.max(...films.map(film => film.id), 0) +1;
    
    const newFilm = {
        id: newId,
        name,
        length,
    };

    films.push(newFilm);
    res.status(201).json(newFilm);
    } catch (error) {
        res.status(500).json({ message: "Error creating film", error: error.message });
    }
});

app.post('/reservations', checkAuth, (req, res) => {
    try {
    const { filmId, date, time } = req.body;

    if(!filmId || !date || !time){
        return res.status(400).json({ message: "Film ID, date and time are required" });
    }
    const film = films.find(film => film.id === parseInt(filmId));
    if (!film) {
        return res.status(404).json({ message: "Film not found" });
    }

    if(reservations.some(reservation => reservation.filmId === filmId)) {
        return res.status(409).json({ message: "Film ID already exists" });
    }

    const newId = Math.max(...reservations.map(reservation => reservation.id), 0) +1;
    
    const newReservation = {
        id: newId,
        filmId,
        username: req.body.username,
        date,
        time
    };
    reservations.push(newReservation);
    res.status(201).json(newReservation);
    } catch (error) {
        res.status(500).json({ message: "Error creating reservation", error: error.message });
    }
});
    
app.get('/reservations/:id', checkAuth, (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const reservation = reservations.find(reservation => reservation.id === id);
        
        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }
        
        const username = req.body.username;
        const user = USERS.find(user => user.username === username);
        
        if (reservation.username === username || (user && user.admin)) {
            res.json(reservation);
        } else {
            res.status(403).json({ message: "Forbidden: You can only view your own reservations" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving reservation", error: error.message });
    }
});