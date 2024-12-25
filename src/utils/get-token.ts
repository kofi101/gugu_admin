export const getUserToken = async () => {
  try {
    const res = await fetch('/api');

    const data = await res.json();
    return data?.token;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get token');
  }
};
