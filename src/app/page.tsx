import Navbar from './components/Navbar';
import Hero from './components/HeroSection';
import HomePageCourse from './components/HomePageCourses';
import StudentTestimonials from './components/StudentTestimonials';
import AboutUs from './components/AboutUs';
import HeroCarousel from "./components/HeroCarousel1 copy";


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HeroCarousel />
      <HomePageCourse />
      <StudentTestimonials />
      <AboutUs />
      
    </>
  );
}


