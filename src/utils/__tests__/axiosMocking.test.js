
import axios from 'axios';
jest.mock('axios');

afterEach(() => {
  jest.clearAllMocks();
});

test('should return mocked data when axios GET is called', async () => {
  axios.get.mockResolvedValue({ data: { id: '1', name: 'Mohan' } });

  const response = await axios.get('/api/user');
  expect(response.data).toEqual({ id: '1', name: 'Mohan' });
});

test('should call POST with correct URL and payload when axios POST is called', async () => {
  axios.post.mockResolvedValue({ data: { token: 'abc123', name: 'Mohan' } });

  const response = await axios.post('/api/auth/login', { email: 'mohan@test.com', password: '1234' });
  expect(response.data.token).toBe('abc123');
  expect(axios.post).toHaveBeenCalledWith('/api/auth/login', { email: 'mohan@test.com', password: '1234' });
});

test('should throw error when axios GET request fails', async () => {
  axios.get.mockRejectedValue(new Error('Network Error'));

  try {
    await axios.get('/api/user');
  } catch (err) {
    expect(err.message).toBe('Network Error');
  }
});
