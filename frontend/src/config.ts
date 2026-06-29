const isProd = import.meta.env.PROD;

export const API_URL = import.meta.env.VITE_API_URL || (isProd 
  ? 'https://welile-car.onrender.com/api' 
  : `http://${window.location.hostname}:3000/api`);
