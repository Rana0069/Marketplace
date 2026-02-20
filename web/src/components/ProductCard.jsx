import { Link } from 'react-router-dom';

export default function ProductCard({ product, onToggleFavorite }) {
  return (
    <div className="card">
      <img src={product.image} alt={product.title} />
      <div className="card-body">
        <h3>{product.title}</h3>
        <p>${product.price.toFixed(2)}</p>
        <div className="actions">
          <Link to={`/products/${product.id}`}>View</Link>
          <button
            className={`favorite-btn ${product.isFavorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(product.id, product.isFavorite)}
          >
            ♥
          </button>
        </div>
      </div>
    </div>
  );
}
