import bannerImage from "@/assets/banner.png";
import LearningAnalysis from "@/components/LearningAnalysis";
import MyModules from "@/components/MyModules";
import TrendingModules from "@/components/TrendingModules";
// import Header from "@/components/header";

export default function LearnerDashboard() {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Header */}
      {/* <Header /> */}

      {/* Banner */}
      <section
        className="relative w-full h-96 bg-cover bg-center px-4 md:px-10 py-6 md:py-16 flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10"
        style={{ backgroundImage: `url(${bannerImage})` }}
      ></section>

      {/* Learning Analysis */}
      <div>
        <LearningAnalysis />
      </div>

      <div>
        <TrendingModules />
      </div>

      {/* <MyModules /> */}
      <div>
        <MyModules />
      </div>
    </div>
  );
}
