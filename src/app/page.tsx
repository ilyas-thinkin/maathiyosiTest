import Navbar from './components/Navbar';
import Hero from './components/HeroSection';
import HomePageCourse from './components/HomePageCourses';
import StudentTestimonials from './components/StudentTestimonials';


export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <HomePageCourse />
      <StudentTestimonials />
      
    </>
  );
}
