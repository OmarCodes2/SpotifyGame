const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  userProfileImage: String,
  accessToken: String,
  refreshToken: String,
  topArtists: [{
    name: String,
    image: String
  }],
  topTracks: [{
    name: String,
    image: String
  }]
});

module.exports = mongoose.model('User', userSchema);
