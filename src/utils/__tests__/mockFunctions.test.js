test('should return mocked value when mock function is called', async () => {
  const mockFn = jest.fn();
  mockFn.mockResolvedValue({ id: '2', name: 'Kumar' });

  const result = await mockFn();
  expect(result).toEqual({ id: '2', name: 'Kumar' });
  expect(mockFn).toHaveBeenCalled();
});

test('should track correct call count when mock function is called multiple times', async () => {
  const mockFn = jest.fn();
  mockFn.mockResolvedValue({ id: '2', name: 'Kumar' });

  await mockFn();
  await mockFn();
  await mockFn();

  expect(mockFn).toHaveBeenCalledTimes(3);
});

test('should receive correct arguments when mock function is called with payload', async () => {
  const mockFn = jest.fn();
  mockFn.mockResolvedValue({ id: '2', name: 'Kumar' });

  await mockFn({ email: 'mohan@test.com', password: '1234' });

  expect(mockFn).toHaveBeenCalledWith({ email: 'mohan@test.com', password: '1234' });
});
