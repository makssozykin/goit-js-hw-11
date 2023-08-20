import '../src/style.css';
import { fetchImages } from "./pixabay_API";
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
    loader: document.querySelector('.loader'),
    btnUp: document.getElementById('to-top-btn'),
    btnUpWrapper: document.querySelector('.btn-up'),
};

let query = '';
let page = 1;
let simpleLightBox;
const perPage = 40;
refs.loadMore.classList.replace('load-more', 'load-more-hidden');
refs.loader.textContent = '';
refs.loader.classList.replace('loader', 'is-hidden');

refs.form.addEventListener('submit', onSearch);
refs.loadMore.addEventListener("click", onLoadMore);

function onSearch(e) { 
    e.preventDefault();
    refs.loader.classList.replace('is-hidden', 'loader');
    query = e.currentTarget.elements.searchQuery.value.trim();
    refs.gallery.innerHTML = '';

    if (query === '') {
         refs.loadMore.classList.replace('load-more', 'load-more-hidden');
         setTimeout(() => {
             Notiflix.Notify.failure(
      'The search string cannot be empty. Please specify your search query.'
         );
             refs.loader.classList.replace('loader', 'is-hidden');
         }, 1000);
    return;
}
fetchImages(query, page, perPage)
    .then(response => {
      if (response.totalHits === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
          );
          refs.loader.classList.replace('loader','is-hidden');
      } else {
        refs.gallery.insertAdjacentHTML(
          'beforeend',
          createMarkup(response.hits)
          );
          refs.loader.classList.replace('loader', 'is-hidden');
        simpleLightBox = new SimpleLightbox('.gallery a', {
        captions: true,
        captionsData: 'alt',
        captionPosition: 'bottom',
        captionDelay: 250,
        close: true,
        closeText: '×',
        nav: true,
        navText: ['←', '→'],
        overlay: true,
        overlayOpacity: 0.5,
        showCounter: true,
        animationSlide: true,
        widthRatio: 0.8,
        heightRatio: 0.8,
    }).refresh();
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
            refs.loader.classList.replace('loader', 'is-hidden');
            refs.gallery.insertAdjacentHTML('beforeend', createMarkup(response.hits));
            simpleLightBox = new SimpleLightbox('.gallery a', {
                captions: true,
                captionsData: 'alt',
                captionPosition: 'bottom',
                captionDelay: 250,
                close: true,
                closeText: '×',
                nav: true,
                navText: ['←', '→'],
                overlay: true,
                overlayOpacity: 0.5,
                showCounter: true,
                animationSlide: true,
                widthRatio: 0.8,
                heightRatio: 0.8,
            }).refresh();

            scrollPage();

            const totalPages = Math.ceil(response.totalHits / perPage);
      
            if (page < totalPages) {
                refs.loader.classList.replace('is-hidden', 'loader');
                refs.loadMore.disabled = false;
            } else {
                Notiflix.Notify.failure(
                    "We're sorry, but you've reached the end of search results."
                );
                refs.loader.classList.replace('loader', 'is-hidden');
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
            return `
        <a class="gallery__link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b> <span>${likes}</span></p>
              <p class="info-item"><b>Views</b> <span>${views}</span></p>
              <p class="info-item"><b>Comments</b> <span>${comments}</span></p>
              <p class="info-item"><b>Downloads</b> <span>${downloads}</span></p>
            </div>
          </div>
          </a>`;
      }
    )
    .join('');
}



function onFetchError(error) {
    console.log(error);
    
    refs.loadMore.classList.replace('load-more', 'load-more-hidden');
    refs.loader.classList.replace('loader','is-hidden');
    
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

//  smooth scrolling
function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

// Button smooth scroll up

window.addEventListener('scroll', scrollFunction);

function scrollFunction() {
  if (document.body.scrollTop > 30 || document.documentElement.scrollTop > 30) {
    refs.btnUpWrapper.style.display = 'flex';
  } else {
    refs.btnUpWrapper.style.display = 'none';
  }
}
refs.btnUp.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});