import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/products/${id}`).then(({ data }) => setProduct(data));
  }, [id]);

  if (!product) return <p className="container">Loading...</p>;

  return (
    <main className="container detail">
      <img src={product.image} alt={product.title} />
      <div>
        <h1>{product.title}</h1>
        <p className="price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
      </div>
    </main>
  );
}
