import { Link } from "react-router-dom";

export default function NotFound() {
  return <div className="empty-state not-found"><h1>404</h1><h2>Page not found</h2><p>The page you are looking for does not exist.</p><Link className="primary-link" to="/">Back to feed</Link></div>;
}
