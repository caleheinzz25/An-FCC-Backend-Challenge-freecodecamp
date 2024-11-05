import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log("Berhasil terhubung dengan MongoDB");
  })
  .catch((err) => {
    console.error("Error: " + err);
  });

// Define User Schema
const userSchema = new mongoose.Schema({
  username: {type: String, required: true},
  count: { type: Number, default: 0 },
  log: [{
    description: String,
    duration: Number,
    date: { type: Date, default: Date.now },
  }]
});

// Define User Model
const Users = mongoose.model('Users', userSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Post Username to mongodb
app.post('/api/users', async (req, res) => {
  try {
    // Create a new user instance
    const newUser = new Users({
      username: req.body.username
    });
    // Save the new user to the database
    const savedUser = await newUser.save();

    // Send the response with the created user's username and _id
    res.json({
      username: savedUser.username,
      _id: savedUser._id
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error creating user' });
  }
});

// get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await Users.find({});
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error retrieving users' });
  }
}); 

// post a exerciseto user
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const { _id } = req.params;
    const { description, duration, date } = req.body;

    // Find user by ID
    const user = await Users.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new exercise entry
    const exercise = {
      description,
      duration: parseInt(duration),
      date: date ? new Date(date) : new Date()
    };

    // Add exercise to user's log and increment count
    user.log.push(exercise);
    user.count = user.log.length;

    // Save the updated user
    await user.save();

    // Respond with the updated user data
    res.json({
      username: user.username,
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString(),
      _id: user._id
    });
  } catch (error) {
    res.status(500).json({ error: 'Error adding exercise' });
  }
});

// get all users exercises
app.get('/api/users/:_id/logs', async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    // Find the user by ID
    const user = await Users.findById(_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Filter the exercise log based on the from, to, and limit query parameters
    let logs = user.log;

    // Filter by date if from/to are provided
    if (from) {
      const fromDate = new Date(from);
      logs = logs.filter(exercise => exercise.date >= fromDate);
    }
    if (to) {
      const toDate = new Date(to);
      logs = logs.filter(exercise => exercise.date <= toDate);
    }

    // Apply limit if provided
    if (limit) {
      logs = logs.slice(0, parseInt(limit));
    }

    // Format the log entries' date as strings
    const formattedLogs = logs.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));

    // Respond with user data including count and log
    res.json({
      username: user.username,
      count: formattedLogs.length,
      _id: user._id,
      log: formattedLogs
    });
  } catch (error) {
    console.error("Error retrieving exercise log:", error);
    res.status(500).json({ error: 'Error retrieving exercise log' });
  }
});

// Start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port http://localhost:' + listener.address().port);
});
