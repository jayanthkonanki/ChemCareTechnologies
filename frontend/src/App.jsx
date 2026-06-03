import Hero from './components/Hero'
import About from './components/About'
import Products from './components/Products'
import Contact from './components/Contact'

function App() {
  return (
    <>
      <Hero />
      <About />
      <Products />
      <Contact />
      <footer>
        <p>&copy; {new Date().getFullYear()} Chem Care Technologies. All rights reserved.</p>
      </footer>
    </>
  )
}

export default App
