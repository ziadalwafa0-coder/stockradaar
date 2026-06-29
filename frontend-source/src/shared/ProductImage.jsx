export default function ProductImage({ src, name }) {
  return (
    <img
      src={src || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=160&q=80"}
      alt={name}
      className="h-12 w-12 rounded-lg object-cover"
      loading="lazy"
    />
  );
}
