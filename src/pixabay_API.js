import axios from "axios";
const API_KEY = '38944532-b9bc2caa643ed39ffb47780c7';

const BASE_URL = 'https://pixabay.com/api/';

async function fetchImages(query, page, perPage) {
  const params = new URLSearchParams({
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: perPage,
    query: query,
  });

  const response = await axios.get(`${BASE_URL}?key=${API_KEY}&${params}`);
  return response.data;
}

export { fetchImages };