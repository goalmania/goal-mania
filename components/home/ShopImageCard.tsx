// src/components/ProductGrid.tsx
import React from 'react';

// Define a type for your product data for better type safety
interface Product {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
}

// Sample product data, replace with your actual data
const products: Product[] = [
  {
    id: 1,
    title: 'Qualità Super',
    description: 'Le nostre maglie sono capi curati nei minimi dettagli con materiali premium. Perfetta per i veri appassionati che vogliono collezionare emozioni, non solo tessuto.',
    imageUrl: 'https://i.imgur.com/YwX7wzG.png', // Replace with your image URL
    buttonText: 'Buy Now →',
    buttonLink: '#',
  },
  {
    id: 2,
    title: 'Modelli introvabili',
    description: 'Associa un testo o un\'immagine per dare importanza al prodotto, alla collezione o all\'articolo del blog di tua scelta. Aggiungi dettagli sulla disponibilità, sullo stile o fornisci una recensione.',
    imageUrl: 'https://i.imgur.com/gK9q0aB.png', // Replace with your image URL
    buttonText: 'Buy Now →',
    buttonLink: '#',
  },
  {
    id: 3,
    title: 'Vestibilità perfetta',
    description: 'Associa un testo o un\'immagine per dare importanza al prodotto, alla collezione o all\'articolo del blog di tua scelta. Aggiungi dettagli sulla disponibilità, sullo stile o fornisci una recensione.',
    imageUrl: 'https://i.imgur.com/s6nE0jM.png', // Replace with your image URL
    buttonText: 'Buy Now →',
    buttonLink: '#',
  },
  {
    id: 4,
    title: 'Qualità Super',
    description: 'Le nostre maglie sono capi curati nei minimi dettagli con materiali premium. Perfetta per i veri appassionati che vogliono collezionare emozioni, non solo tessuto.',
    imageUrl: 'https://i.imgur.com/YwX7wzG.png', // Replace with your image URL
    buttonText: 'Buy Now →',
    buttonLink: '#',
  },
];

const ShopImageCard: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="relative bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-0"
            >
              <div className="md:w-1/2 p-6 order-2 md:order-1 text-center md:text-left">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {product.description}
                </p>
                <a
                  href={product.buttonLink}
                  className="inline-block bg-orange-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-orange-600 transition-colors"
                >
                  {product.buttonText}
                </a>
              </div>
              <div className="md:w-1/2 h-64 md:h-auto overflow-hidden order-1 md:order-2 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-blue-900 clip-product-bg md:clip-product-bg-md"></div>
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="relative z-10 w-full h-full object-contain transform scale-110 md:scale-100" // Adjust scale as needed for image fit
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopImageCard;