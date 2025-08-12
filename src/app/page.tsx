import Navbar from './components/Navbar';
import Hero from './components/HeroSection';
import HomePageCourse from './components/HomePageCourses';
import StudentTestimonials from './components/StudentTestimonials';
import AboutUs from './components/AboutUs';


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HomePageCourse />
      <StudentTestimonials />
      <AboutUs />
      
    </>
  );
}
