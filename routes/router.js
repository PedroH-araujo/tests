const express = require('express');
const router = express.Router();
const isValidISODate = require('../utils/validDate');
const BrowserService = require('../services/BrowserService');
const moment = require('moment');

router.get('/', (req, res) => {
    res.send('Hello Asksuite World!');
});

router.post('/search', async (req, res) => {
    console.log('Received search request:', req.body);
    const { checkin, checkout } = req.body || {};
  
    if (!checkin || !checkout) {
      return res.status(400).json({ error: 'checkin and checkout are required' });
    }
  
    if (!isValidISODate(checkin) || !isValidISODate(checkout)) {
      return res.status(400).json({ error: 'dates must be in YYYY-MM-DD format' });
    }
  
    if (moment(checkin).startOf('day') >= moment(checkout).endOf('day')) {
      return res.status(400).json({ error: 'checkout must be after checkin' });
    }

    if (moment(checkin) <= moment()) {
      return res.status(400).json({ error: 'checkin must be a future date' });
    }

    if (moment(checkout).diff(moment(checkin), 'days') < 2) {
      return res.status(400).json({ error: 'a minimum stay of 2 days is required' });
    }
  
    try {
      const rooms = await BrowserService.searchRooms(checkin, checkout);
      return res.json(rooms);
    } catch (err) {
      console.error('Crawler error:', err);
      return res.status(500).json({ error: 'failed to fetch rooms' });
    }
  });

module.exports = router;
