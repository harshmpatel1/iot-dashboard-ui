import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
      <p className="text-gray-600 mt-2">Sorry, the page you are looking for does not exist.</p>
      <Link to="/" className="mt-6 px-6 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;