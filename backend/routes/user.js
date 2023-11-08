const express = require('express');
const axios = require('axios');
const User = require('../models/User');

const router = express.Router();

const spotifyApiBaseUrl = 'https://api.spotify.com/v1';

// Helper function to get access and refresh tokens from Spotify
const getSpotifyTokens = async (authCode) => {
  const response = await axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: new URLSearchParams({
      grant_type: 'authorization_code',
      code: authCode,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
    }
  });

  return response.data;
};

// Endpoint to create a user
router.post('/create', async (req, res) => {
  try {
    const { authCode } = req.body;
    const tokens = await getSpotifyTokens(authCode);
    const { access_token, refresh_token } = tokens;

    // Use the access token to get user's Spotify profile and top tracks/artists
    const userResponse = await axios.get(`${spotifyApiBaseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${access_token}` }
    });

    const username = userResponse.data.id;
    const userProfileImage = userResponse.data.images[0]?.url;

    // ... similar calls for user's top tracks and artists
    // Remember to check the Spotify API documentation for the exact endpoints

    // Create a new user in the database
    const user = new User({
      username,
      userProfileImage,
      accessToken: access_token,
      refreshToken: refresh_token,
      topArtists: [], // Replace with actual data after fetching from Spotify
      topTracks: [],  // Replace with actual data after fetching from Spotify
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error in /create:', error);
    res.status(400).json({ message: 'Error creating user', error: error.response?.data || error.message });
  }
});

// Endpoint to get a user's profile
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in GET /:username', error);
    res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
});

module.exports = router;
