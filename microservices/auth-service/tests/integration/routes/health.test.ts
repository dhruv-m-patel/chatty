import app from '../../../src/app';
import request from 'supertest';
import { ENDPOINTS } from '../../../src/constants';

describe('Integration: /api/health', () => {
  it('should return response for GET /health', (done) => {
    request(app)
      .get(ENDPOINTS.HEALTH)
      .send()
      .then((res) => {
        expect(res.status).toEqual(200);
        expect(res.body).toEqual({
          uptime: expect.any(Number),
          status: 'OK',
          serviceName: 'Auth Service',
          timestamp: expect.any(String),
          pid: expect.any(Number),
        });
        done();
      });
  });
});
