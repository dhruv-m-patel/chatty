export async function post(url: string, data: any): Promise<object> {
  const validUserIds: Array<string> = ['User 1', 'user 2', 'user 3'];
  if (url.includes('login'))
    return Promise.resolve({
      data: {
        access_token: 'anything',
      },
    });
  const result: Array<object> = [];
  validUserIds.forEach((validUserId) => {
    if (
      data.where._id.$in.findIndex((user: string) => user === validUserId) !==
      -1
    )
      result.push({ _id: validUserId });
  });
  return Promise.resolve({ data: { documents: result } });
}
