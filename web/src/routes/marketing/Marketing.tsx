import { Footer } from './Footer'
import { Hero } from './Hero'
import { Nav } from './Nav'
import { Pricing } from './Pricing'
import { ProductStory } from './ProductStory'

export function Marketing() {
  return (
    <div className="min-h-dvh text-text">
      <Nav />
      <main>
        <Hero />
        <ProductStory />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
