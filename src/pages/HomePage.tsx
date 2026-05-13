import Hero from '../components/home/Hero';
import Categories from '../components/home/Categories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Lifestyle from '../components/home/Lifestyle';
import Benefits from '../components/home/Benefits';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <Lifestyle />
      <Benefits />
    </>
  );
}
