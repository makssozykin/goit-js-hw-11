import axios from "axios";
const API_KEY = '38944532-b9bc2caa643ed39ffb47780c7';

const BASE_URL = 'https://pixabay.com/api/';

export class pixabayAPI { 
    constructor() {
    this.query = '';
    this.page = 1;
    this.perPage = 40;
  }

    async fetchImages() {
      const params = new URLSearchParams({
       q: this.query,
       image_type: 'photo',
       orientation: 'horizontal',
       safesearch: true,
       page: this.page,
       per_page: this.perPage,
       query: this.query,
  });
    
    const response = await axios.get(`${BASE_URL}?key=${API_KEY}&${params}`);
    return response.data;
    
    }
    
    incrementPage() {
    this.page += 1;
  }

    resetPage() { 
    this.page = 1;
  }
}
