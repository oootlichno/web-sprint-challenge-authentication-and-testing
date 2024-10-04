const db = require('../data/dbConfig');
const server = require('./server');
const request = require('supertest');
const Joke = require('./jokes/jokes-data');
const User = require('./auth/auth-router');


beforeAll(async () => {
    await db.migrate.rollback(); 
    await db.migrate.latest();
  })
  beforeEach(async () => {
    await db('users').truncate();
  })
  afterAll(async () => {
    await db.destroy();
  })
  
   it('correct env var', () => {
    expect(process.env.NODE_ENV).toBe('testing')
  })

  describe('[POST] /api/auth/register', () => {
    it('should return 201 and create a new user', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });

      expect(res.status).toBe(201);
      expect(res.body.username).toBe('testuser');
    });

    it('should return 400 if username or password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: '', password: 'password' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });

    it('should return 400 if username is already taken', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });

      const res = await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username taken');
    });
  });

  describe('[POST] /api/auth/login', () => {
    it('should return 200 and a welcome message with token for valid credentials', async () => {
      await request(server)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'password' });
  
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'password' });
  
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('welcome, testuser');
      expect(res.body.token).toBeDefined();
  
      token = res.body.token;
    });
  
    it('should return 401 for invalid credentials', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: 'wronguser', password: 'wrongpassword' });
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('invalid credentials');
    });
  
    it('should return 400 if username or password is missing', async () => {
      const res = await request(server)
        .post('/api/auth/login')
        .send({ username: '', password: 'password' });
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('username and password required');
    });
  });


  describe('Jokes Router', () => {
    it('should return 200 and jokes with valid token', async () => {
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', token); 
  
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3); 
    });
  
    it('should return 401 if token is missing', async () => {
      const res = await request(server)
        .get('/api/jokes');
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('token required');
    });
  
    it('should return 401 if token is invalid', async () => {
      const res = await request(server)
        .get('/api/jokes')
        .set('Authorization', 'invalidToken');
  
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('token invalid');
    });
  });