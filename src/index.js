import '../src/style.css';
import { pixabayAPI } from "./pixabay_API";
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const refs = {
    form: document.querySelector('.search-form'),
    gallery: document.querySelector('.gallery'),
    loadMore: document.querySelector('.load-more'),
    body: document.querySelector('body'),
    btnUp: document.getElementById('to-top-btn'),
    btnUpWrapper: document.querySelector('.btn-up'),
};

let sumPage = 0;

const pixabay = new pixabayAPI();


const simpleLightBox = new SimpleLightbox('.gallery a', {
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
});

spinnerPlay();

window.addEventListener('load', () => {
  console.log('All resources finished loading!');

  spinnerStop();
});

refs.loadMore.classList.replace('load-more', 'load-more-hidden');


refs.form.addEventListener('submit', onSearch);
refs.loadMore.addEventListener("click", onLoadMore);

function onSearch(e) { 
    e.preventDefault();
    spinnerPlay();
    pixabay.query = e.currentTarget.elements.searchQuery.value.trim().toLowerCase();
    clearPage();

    if (pixabay.query === '') {
        refs.loadMore.classList.replace('load-more', 'load-more-hidden');
        setTimeout(() => {
            spinnerStop();
            Notiflix.Notify.failure(
            'The search string cannot be empty. Please specify your search query.'
            );
         }, 1000);
        return;
    }
    fetchGallery().then((data) => {
        if (data) {
            Notiflix.Notify.success(`Hooray! We found ${data} images.`)
        }
    });
}
function onLoadMore() {
    pixabay.incrementPage();
    fetchGallery();
    scrollPage();
}

async function fetchGallery() { 
    const result = await pixabay.fetchImages();
    const { hits, total, totalHits } = result;
    
    sumPage += hits.length;

    try {
        if (totalHits === 0) {
            Notiflix.Notify.failure(
                `Sorry, there are no images matching your search query. Please try again.`
            );
            refs.loadMore.classList.replace('load-more', 'load-more-hidden');
            return;
        } else { 
            refs.loadMore.disabled = false;
            
        }
        spinnerStop();
        refs.gallery.insertAdjacentHTML('beforeend', createMarkup(hits));
        simpleLightBox.refresh();

        if (sumPage < total) {
            spinnerPlay();
            refs.loadMore.classList.replace('load-more-hidden', 'load-more');
            refs.loadMore.disabled = false;
        }
        if (sumPage >= total) {
            Notiflix.Notify.failure(
                "We're sorry, but you've reached the end of search results."
            );
            spinnerStop();
            refs.loadMore.classList.replace('load-more', 'load-more-hidden');
        }
    }
    catch (error) {
        onFetchError(error);
    }
    finally {
        refs.form.reset();
        spinnerStop();
    }
    return hits, total, totalHits;
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
    spinnerStop();
    
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

/**
  |============================
  | Spinner
  |============================
*/

function spinnerPlay() {
  refs.body.classList.add('loading');
}

function spinnerStop() {
  window.setTimeout(function () {
    refs.body.classList.remove('loading');
    refs.body.classList.add('loaded');
  }, 1000);
}

/**
  |============================
  | Clear Page
  |============================
*/

function clearPage() {
    pixabay.resetPage();
  refs.gallery.innerHTML = '';
  refs.loadMore.classList.replace('load-more', 'load-more-hidden');
}