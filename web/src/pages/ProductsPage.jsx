import { useEffect, useState } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const fetchProducts = async () => {
    const { data } = await api.get('/products', { params: { page, search, limit: 6 } });
    setProducts(data.data);
    setPagination(data.pagination);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const toggleFavorite = async (id, isFavorite) => {
    if (isFavorite) {
      await api.delete(`/products/${id}/favorite`);
    } else {
      await api.post(`/products/${id}/favorite`);
    }
    fetchProducts();
  };

  return (
    <main className="container">
      <div className="toolbar">
        <input
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onToggleFavorite={toggleFavorite} />
        ))}
      </div>

      <div className="pager">
        <button onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
        <span>
          Page {page} of {pagination.totalPages || 1}
        </span>
        <button onClick={() => setPage((p) => Math.min(pagination.totalPages || 1, p + 1))}>Next</button>
      </div>
    </main>
  );
}
