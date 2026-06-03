import { useState, useEffect } from 'react'
import Hero from './components/Hero'
import About from './components/About'
import Products from './components/Products'
import Contact from './components/Contact'

function App() {
  const [data, setData] = useState(null)

  useEffect(() => {
    // Try full scraped data first, fall back to basic data
    fetch('/data_full.json')
      .then(r => r.ok ? r.json() : Promise.reject())
      .catch(() => fetch('/data.json').then(r => r.json()))
      .then(json => {
        // Normalize: if it's data_full.json it has company + categories
        // If it's basic data.json, wrap products into a single category
        if (!json.categories) {
          json.categories = [{
            name: 'All Products',
            slug: 'all-products',
            products: (json.products || []).map(p => ({
              ...p,
              thumbnail: p.image || '',
              category: 'All Products'
            }))
          }]
        }
        setData(json)
      })
      .catch(console.error)
  }, [])

  return (
    <>
      <Hero data={data} />
      <About data={data} />
      <Products data={data} />
      <Contact data={data} />
      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Chem Care Technologies. All rights reserved.</p>
          <p style={{ opacity: 0.5, fontSize: '0.875rem', marginTop: '0.5rem' }}>Kanuru, Vijayawada, Andhra Pradesh, India</p>
        </div>
      </footer>
    </>
  )
}

export default App
