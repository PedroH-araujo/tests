const request = require('supertest');
const app = require('../server'); 

jest.mock('../services/BrowserService', () => ({
    searchRooms: jest.fn(), 
}));
const { searchRooms } = require('../services/BrowserService');


const sampleRooms = [
  {
    name: "STUDIO CASAL",
    description: "Apartamentos localizados no prédio principal do Resort...",
    price: "R$ 1.092,00",
    image: "https://s3.sa-east-1.amazonaws.com/fasthotel.cdn/quartosTipo/214-1-1632320429599483292-thumb.jpg"
  },
  {
    name: "CABANA",
    description: "Apartamentos espalhados pelos jardins do Resort...",
    price: "R$ 1.321,00",
    image: "https://s3.sa-east-1.amazonaws.com/fasthotel.cdn/quartosTipo/214-1-1632320429599483292-thumb.jpg"
  }
];

describe('POST /search', () => {
  jest.useFakeTimers();
  beforeEach(() => {
    jest.setSystemTime(new Date('2020-01-06T17:00:00.000Z')); 
    searchRooms.mockReset();
    
  });

  test('returns 400 when body missing dates', async () => {
    const res = await request(app).post('/search').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'checkin and checkout are required');
  });

  test('returns 400 when checkout is before checkin', async () => {
    const res = await request(app).post('/search').send({ checkin: '2021-07-03', checkout: '2021-07-01' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'checkout must be after checkin');
  });

  test('returns 400 when checkin is not a future date', async () => {
    const res = await request(app)
      .post('/search')
      .send({ checkin: '2000-01-01', checkout: '2021-07-03' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'checkin must be a future date');
  });

  test('returns 400 when stay is less than 2 days', async () => {
    const res = await request(app)
      .post('/search')
      .send({ checkin: '2021-07-01', checkout: '2021-07-02' });
    
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error', 'a minimum stay of 2 days is required');
  });

  test('returns 500 on crawler failure', async () => {
    searchRooms.mockRejectedValue(new Error('crawler failure'));
    const res = await request(app)
      .post('/search')
      .send({ checkin: '2021-07-01', checkout: '2021-07-03' });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error', 'failed to fetch rooms');
  });

  test('returns 200 and room data on success', async () => {
    searchRooms.mockResolvedValue(sampleRooms);
    const res = await request(app)
      .post('/search')
      .send({ checkin: '2021-07-01', checkout: '2021-07-03' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(sampleRooms);
  });
});