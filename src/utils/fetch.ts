export const fetchUtil = async (url: string, options?: RequestInit) => {
  try {
    const res = await fetch(url, options);

    // Check if the response is not in the 2xx range
    if (!res.ok) {
      const errorMessage = await getErrorMessage(res);
      throw new Error(
        `Error ${res.status}: ${res.statusText} - ${errorMessage}`
      );
    }

    // Try parsing JSON
    try {
      return await res.json();
    } catch (jsonError) {
      throw new Error('Failed to parse JSON response.');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
    throw new Error(error.message || 'An unknown error occurred.');
  }
};

const getErrorMessage = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || 'No additional error details available.';
  } catch {
    return res.statusText;
  }
};
