import '../src/style.css';
import { fetchImages } from "./pixabay_API";
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
};

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;
refs.loadMore.classList.replace('load-more', 'load-more-hidden');

refs.form.addEventListener('submit', onSearch);
refs.loadMore.addEventListener("click", onLoadMore);

function onSearch(e) { 
    e.preventDefault();
    query = e.currentTarget.elements.searchQuery.value.trim();
    refs.gallery.innerHTML = '';

     if (query === '') {
    Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
    );
    return;
}
fetchImages(query, page, perPage)
    .then(response => {
      if (response.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(response.hits)
        );
        simpleLightBox = new SimpleLightbox('.gallery a').refresh();
        Notiflix.Notify.success(
          `Hooray! We found ${response.totalHits} images.`
        );
        refs.loadMore.classList.replace('load-more-hidden', 'load-more');
        refs.loadMore.disabled = false;
      }
    })
    .catch(onFetchError)
    .finally(() => {
      refs.form.reset();
    });
}
function onLoadMore() {
  page += 1;
  refs.loadMore.disabled = true;

  fetchImages(query, page, perPage).then(response => {
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(response.hits));
    simpleLightBox = new SimpleLightbox('.gallery a').refresh();

    const totalPages = Math.ceil(response.totalHits / perPage);

    if (page < totalPages) {
      refs.loadMore.classList.replace('load-more-hidden', 'load-more');
      refs.loadMore.disabled = false;
    } else {
      Notiflix.Notify.failure(
        "We're sorry, but you've reached the end of search results."
      );
      refs.loadMore.classList.replace('load-more', 'load-more-hidden');
    }
  });
}

function createMarkup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        id,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<a class="gallery__link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${likes}</p>
              <p class="info-item"><b>Views</b>${views}</p>
              <p class="info-item"><b>Comments</b>${comments}</p>
              <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>`;
      }
    )
    .join('');
}

function onFetchError(error) {
  console.log(error);

  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      position: 'center-center',
      timeout: 5000,
      width: '400px',
      fontSize: '24px',
    }
  );
}