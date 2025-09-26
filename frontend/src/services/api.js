import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple demo state persistence using localStorage
const getDemoState = () => {
  try {
    const state = localStorage.getItem('demoState');
    return state ? JSON.parse(state) : {
      reviews: [],
      watchlist: [],
      userProfile: {
        _id: 'demo-user-1',
        username: 'Demo User',
        email: 'demo@test.com',
        bio: 'Movie enthusiast and avid reviewer',
        favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
        createdAt: '2023-01-01T00:00:00.000Z'
      }
    };
  } catch (error) {
    return {
      reviews: [],
      watchlist: [],
      userProfile: {
        _id: 'demo-user-1',
        username: 'Demo User',
        email: 'demo@test.com',
        bio: 'Movie enthusiast and avid reviewer',
        favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
        createdAt: '2023-01-01T00:00:00.000Z'
      }
    };
  }
};

const saveDemoState = (state) => {
  try {
    localStorage.setItem('demoState', JSON.stringify(state));
  } catch (error) {
    console.log('Failed to save demo state:', error);
  }
};

// Sample data for fallback when backend is not available
const sampleMovies = [
  {
    _id: '1',
    title: 'The Shawshank Redemption',
    genre: ['Drama'],
    releaseYear: 1994,
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman'],
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
    averageRating: 4.8,
    totalReviews: 152,
    duration: 142,
    language: 'English'
  },
  {
    _id: '2',
    title: 'The Godfather',
    genre: ['Crime', 'Drama'],
    releaseYear: 1972,
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
    averageRating: 4.7,
    totalReviews: 98,
    duration: 175,
    language: 'English'
  },
  {
    _id: '3',
    title: 'The Dark Knight',
    genre: ['Action', 'Crime', 'Drama'],
    releaseYear: 2008,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    synopsis: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    averageRating: 4.6,
    totalReviews: 203,
    duration: 152,
    language: 'English'
  },
  {
    _id: '4',
    title: 'Pulp Fiction',
    genre: ['Crime', 'Drama'],
    releaseYear: 1994,
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    synopsis: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
    averageRating: 4.5,
    totalReviews: 167,
    duration: 154,
    language: 'English'
  },
  {
    _id: '5',
    title: 'Forrest Gump',
    genre: ['Drama', 'Romance'],
    releaseYear: 1994,
    director: 'Robert Zemeckis',
    cast: ['Tom Hanks', 'Robin Wright', 'Gary Sinise'],
    synopsis: 'The presidencies of Kennedy and Johnson, Vietnam, Watergate, and other history unfold through the perspective of an Alabama man.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg',
    averageRating: 4.4,
    totalReviews: 134,
    duration: 142,
    language: 'English'
  },
  {
    _id: '6',
    title: 'Inception',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    releaseYear: 2010,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Marion Cotillard', 'Tom Hardy'],
    synopsis: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    averageRating: 4.3,
    totalReviews: 189,
    duration: 148,
    language: 'English'
  },
  {
    _id: '7',
    title: 'The Matrix',
    genre: ['Action', 'Sci-Fi'],
    releaseYear: 1999,
    director: 'The Wachowskis',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    synopsis: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    averageRating: 4.2,
    totalReviews: 156,
    duration: 136,
    language: 'English'
  },
  {
    _id: '8',
    title: 'Goodfellas',
    genre: ['Biography', 'Crime', 'Drama'],
    releaseYear: 1990,
    director: 'Martin Scorsese',
    cast: ['Robert De Niro', 'Ray Liotta', 'Joe Pesci'],
    synopsis: 'The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg',
    averageRating: 4.1,
    totalReviews: 143,
    duration: 146,
    language: 'English'
  },
  {
    _id: '9',
    title: 'Schindler\'s List',
    genre: ['Biography', 'Drama', 'History'],
    releaseYear: 1993,
    director: 'Steven Spielberg',
    cast: ['Liam Neeson', 'Ralph Fiennes', 'Ben Kingsley'],
    synopsis: 'In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg',
    averageRating: 4.0,
    totalReviews: 178,
    duration: 195,
    language: 'English'
  },
  {
    _id: '10',
    title: 'Fight Club',
    genre: ['Drama'],
    releaseYear: 1999,
    director: 'David Fincher',
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    synopsis: 'An insomniac office worker and a devil-may-care soapmaker form an underground fight club.',
    posterUrl: 'https://image.tmdb.org/t/p/w500/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    averageRating: 3.9,
    totalReviews: 192,
    duration: 139,
    language: 'English'
  }
];

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // 5 second timeout
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback functions that return sample data
const fallbackAPI = {
  getFeaturedMovies: async () => {
    await simulateDelay();
    return {
      data: {
        featured: sampleMovies.slice(0, 4),
        recent: sampleMovies.slice(6, 10)
      }
    };
  },
  
  getMovies: async (params = {}) => {
    await simulateDelay();
    let movies = [...sampleMovies];
    
    // Apply filters
    if (params.search) {
      movies = movies.filter(movie => 
        movie.title.toLowerCase().includes(params.search.toLowerCase()) ||
        movie.director.toLowerCase().includes(params.search.toLowerCase()) ||
        movie.genre.some(g => g.toLowerCase().includes(params.search.toLowerCase()))
      );
    }
    
    if (params.genre) {
      movies = movies.filter(movie => movie.genre.includes(params.genre));
    }
    
    if (params.year) {
      movies = movies.filter(movie => movie.releaseYear.toString() === params.year);
    }
    
    if (params.minRating) {
      movies = movies.filter(movie => movie.averageRating >= parseFloat(params.minRating));
    }
    
    // Apply sorting
    if (params.sortBy) {
      switch (params.sortBy) {
        case 'rating':
          movies.sort((a, b) => b.averageRating - a.averageRating);
          break;
        case 'year':
          movies.sort((a, b) => b.releaseYear - a.releaseYear);
          break;
        case 'title':
          movies.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'oldest':
          movies.sort((a, b) => a.releaseYear - b.releaseYear);
          break;
        default: // newest
          movies.sort((a, b) => b.releaseYear - a.releaseYear);
      }
    }
    
    // Apply pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMovies = movies.slice(startIndex, endIndex);
    
    return {
      data: {
        movies: paginatedMovies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(movies.length / limit),
          totalMovies: movies.length,
          limit: limit
        }
      }
    };
  },
  
  getMovie: async (id) => {
    await simulateDelay();
    const movie = sampleMovies.find(m => m._id === id);
    if (!movie) {
      throw new Error('Movie not found');
    }
    
    const demoState = getDemoState();
    const movieReviews = demoState.reviews.filter(r => 
      r.movieId._id === id || r.movieId === id
    );
    
    return {
      data: {
        movie: movie,
        isInWatchlist: demoState.watchlist.some(m => m._id === id),
        reviews: movieReviews
      }
    };
  }
};

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      return await api.post('/auth/login', credentials);
    } catch (error) {
      // Demo login - always succeed with demo credentials
      if (credentials.email === 'admin@test.com' || credentials.email === 'user@test.com') {
        await simulateDelay();
        const demoUser = {
          _id: '1',
          username: credentials.email === 'admin@test.com' ? 'Admin User' : 'Demo User',
          email: credentials.email,
          isAdmin: credentials.email === 'admin@test.com'
        };
        return {
          data: {
            token: 'demo-jwt-token-' + Date.now(),
            user: demoUser
          }
        };
      }
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      return await api.post('/auth/register', userData);
    } catch (error) {
      // Demo registration - always succeed
      await simulateDelay();
      const demoUser = {
        _id: '2',
        username: userData.username,
        email: userData.email,
        isAdmin: false
      };
      
      // Update demo state with new user
      const demoState = getDemoState();
      demoState.userProfile = {
        ...demoState.userProfile,
        username: userData.username,
        email: userData.email
      };
      saveDemoState(demoState);
      
      return {
        data: {
          token: 'demo-jwt-token-' + Date.now(),
          user: demoUser
        }
      };
    }
  },
  
  getProfile: async () => {
    try {
      return await api.get('/auth/me');
    } catch (error) {
      // Return demo user profile
      await simulateDelay();
      const demoState = getDemoState();
      return {
        data: {
          user: demoState.userProfile
        }
      };
    }
  }
};

// Movies API with fallback
export const moviesAPI = {
  getMovies: async (params = {}) => {
    try {
      return await api.get('/movies', { params });
    } catch (error) {
      console.log('Backend unavailable, using sample data');
      return await fallbackAPI.getMovies(params);
    }
  },
  
  getMovie: async (id) => {
    try {
      return await api.get(`/movies/${id}`);
    } catch (error) {
      console.log('Backend unavailable, using sample data');
      return await fallbackAPI.getMovie(id);
    }
  },
  
  getFeaturedMovies: async () => {
    try {
      return await api.get('/movies/featured/trending');
    } catch (error) {
      console.log('Backend unavailable, using sample data');
      return await fallbackAPI.getFeaturedMovies();
    }
  },
  
  addMovie: (movieData) => api.post('/movies', movieData),
  updateMovie: (id, movieData) => api.put(`/movies/${id}`, movieData),
  deleteMovie: (id) => api.delete(`/movies/${id}`),
};

// Reviews API with persistence
export const reviewsAPI = {
  getMovieReviews: async (movieId, params = {}) => {
    try {
      return await api.get(`/reviews/movie/${movieId}`, { params });
    } catch (error) {
      console.log('Backend unavailable for reviews, using demo data');
      await simulateDelay();
      
      const demoState = getDemoState();
      const movieReviews = demoState.reviews.filter(r => 
        r.movieId._id === movieId || r.movieId === movieId
      );
      
      return {
        data: {
          reviews: movieReviews,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalReviews: movieReviews.length
          }
        }
      };
    }
  },
  
  addReview: async (movieId, reviewData) => {
    try {
      return await api.post(`/reviews/movie/${movieId}`, reviewData);
    } catch (error) {
      console.log('Backend unavailable for adding review, using demo mode');
      await simulateDelay(1000);
      
      const demoState = getDemoState();
      const movie = sampleMovies.find(m => m._id === movieId);
      
      const demoReview = {
        _id: 'demo-review-' + Date.now(),
        userId: {
          _id: demoState.userProfile._id,
          username: demoState.userProfile.username
        },
        movieId: {
          _id: movieId,
          title: movie ? movie.title : 'Unknown Movie'
        },
        rating: reviewData.rating,
        reviewText: reviewData.reviewText,
        timestamp: new Date().toISOString(),
        isEdited: false
      };
      
      demoState.reviews.unshift(demoReview);
      saveDemoState(demoState);
      
      return {
        data: {
          review: demoReview,
          message: 'Review added successfully (demo mode)'
        }
      };
    }
  },
  
  updateReview: async (reviewId, reviewData) => {
    try {
      return await api.put(`/reviews/${reviewId}`, reviewData);
    } catch (error) {
      console.log('Backend unavailable for updating review, using demo mode');
      await simulateDelay(800);
      
      const demoState = getDemoState();
      const reviewIndex = demoState.reviews.findIndex(r => r._id === reviewId);
      
      if (reviewIndex !== -1) {
        demoState.reviews[reviewIndex] = {
          ...demoState.reviews[reviewIndex],
          rating: reviewData.rating,
          reviewText: reviewData.reviewText,
          isEdited: true,
          editedAt: new Date().toISOString()
        };
        saveDemoState(demoState);
        
        return {
          data: {
            review: demoState.reviews[reviewIndex],
            message: 'Review updated successfully (demo mode)'
          }
        };
      }
      
      return {
        data: {
          message: 'Review not found (demo mode)'
        }
      };
    }
  },
  
  deleteReview: async (reviewId) => {
    try {
      return await api.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.log('Backend unavailable for deleting review, using demo mode');
      await simulateDelay(500);
      
      const demoState = getDemoState();
      demoState.reviews = demoState.reviews.filter(r => r._id !== reviewId);
      saveDemoState(demoState);
      
      return {
        data: {
          message: 'Review deleted successfully (demo mode)'
        }
      };
    }
  }
};

// Users API with persistence
export const usersAPI = {
  getProfile: async () => {
    try {
      return await api.get('/users/profile');
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      
      return {
        data: {
          user: demoState.userProfile,
          reviewCount: demoState.reviews.length
        }
      };
    }
  },
  
  updateProfile: async (userData) => {
    try {
      return await api.put('/users/profile', userData);
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      
      demoState.userProfile = {
        ...demoState.userProfile,
        ...userData
      };
      saveDemoState(demoState);
      
      return {
        data: {
          user: demoState.userProfile
        }
      };
    }
  },
  
  getWatchlist: async () => {
    try {
      return await api.get('/users/watchlist');
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      
      return {
        data: demoState.watchlist
      };
    }
  },
  
  addToWatchlist: async (movieId) => {
    try {
      return await api.post(`/users/watchlist/${movieId}`);
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      const movie = sampleMovies.find(m => m._id === movieId);
      
      if (movie && !demoState.watchlist.find(m => m._id === movieId)) {
        demoState.watchlist.push({
          ...movie,
          addedAt: new Date().toISOString()
        });
        saveDemoState(demoState);
      }
      
      return { data: { message: 'Added to watchlist (demo)' } };
    }
  },
  
  removeFromWatchlist: async (movieId) => {
    try {
      return await api.delete(`/users/watchlist/${movieId}`);
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      
      demoState.watchlist = demoState.watchlist.filter(m => m._id !== movieId);
      saveDemoState(demoState);
      
      return { data: { message: 'Removed from watchlist (demo)' } };
    }
  },
  
  getUserReviews: async (params = {}) => {
    try {
      return await api.get('/users/reviews', { params });
    } catch (error) {
      await simulateDelay();
      const demoState = getDemoState();
      
      return {
        data: {
          reviews: demoState.reviews,
          pagination: {
            currentPage: 1,
            totalPages: Math.ceil(demoState.reviews.length / 10),
            totalReviews: demoState.reviews.length
          }
        }
      };
    }
  }
};

export default api;