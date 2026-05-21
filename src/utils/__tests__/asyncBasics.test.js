
function fetchUser() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ id: '1', name: 'Mohan' });
    }, 100);
  });
}

test('should resolve with correct user object when fetchUser is called', async () => {
  const user = await fetchUser();
  expect(user).toEqual({ id: '1', name: 'Mohan' });
});

test('should return correct id and name when fetchUser resolves', async () => {
  const user = await fetchUser();
  expect(user.id).toBe('1');
  expect(user.name).toBe('Mohan');
});
